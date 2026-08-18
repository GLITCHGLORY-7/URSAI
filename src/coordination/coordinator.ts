import { Incident, Hospital, UrsaiState, Mission, ResponsePlan } from '../types/ursai';
import { fetchAIDecision, fetchReplanRecommendation } from '../services/nimService';
import { runHospitalAgent, HospitalAgentController } from '../agents/hospitalAgent';
import { runAmbulanceAgent, runAmbulanceHospitalTransport, AgentAnimationController } from '../agents/ambulanceAgent';
import { runPoliceAgent } from '../agents/policeAgent';
import { runTrafficAgent } from '../agents/trafficAgent';
import { fireRescueAgent } from '../agents/fireRescueAgent';
import { publicWorksAgent } from '../agents/publicWorksAgent';
import { electricityAgent } from '../agents/electricityAgent';
import { waterSewerageAgent } from '../agents/waterSewerageAgent';
import { disasterManagementAgent } from '../agents/disasterManagementAgent';
import { weatherEnvironmentAgent } from '../agents/weatherEnvironmentAgent';
import { emergencyCommunicationsAgent } from '../agents/emergencyCommunicationsAgent';
import { cityAdministrationAgent } from '../agents/cityAdministrationAgent';
import { emsAgent } from '../agents/emsAgent';
import { evaluateDepartmentSelection } from '../data/departmentMatrix';
import { AMBULANCE_DEPOT, POLICE_DEPOT } from '../data/depots';
import { eventBus } from './eventBus';
import { triggerPredictionAnalysis } from '../services/predictionCoordinator';
import { computeCityState } from '../services/cityDataEngine';
import { evaluateActiveMission } from '../services/missionMonitor';
import { computeMissionOptimization } from '../services/missionOptimizer';

export interface CoordinatorControllers {
  ambulanceController?: AgentAnimationController;
  policeController?: AgentAnimationController;
  hospitalController?: HospitalAgentController;
  cancelAll: () => void;
}

/**
 * URSAI Swarm Coordinator
 * Executes multi-agent coordination based on AI Decision Engine (NVIDIA NIM or Fallback Rule Engine).
 */
export async function coordinateIncidentResponse({
  incident,
  hospitals,
  simulationGeneration,
  dispatch,
  getState,
}: {
  incident: Incident;
  hospitals: Hospital[];
  simulationGeneration: number;
  dispatch: (action: any) => void;
  getState: () => UrsaiState;
}): Promise<CoordinatorControllers> {
  let ambulanceCtrl: AgentAnimationController | undefined;
  let policeCtrl: AgentAnimationController | undefined;
  let trafficCtrl: AgentAnimationController | undefined;
  let hospitalCtrl: HospitalAgentController | undefined;

  let isCancelled = false;
  let monitorIntervalId: NodeJS.Timeout | null = null;

  const cancelAll = () => {
    isCancelled = true;
    if (monitorIntervalId) clearInterval(monitorIntervalId);
    if (ambulanceCtrl) ambulanceCtrl.cancel();
    if (policeCtrl) policeCtrl.cancel();
    if (trafficCtrl) trafficCtrl.cancel();
    if (hospitalCtrl) hospitalCtrl.cancel();
  };

  eventBus.emit('ACCIDENT_DETECTED', incident.id, 'COORDINATOR', { incident });

  // Initial City State Update
  const initialCity = computeCityState(getState());
  dispatch({ type: 'UPDATE_CITY_STATE', payload: initialCity });

  // Step 1: AI Decision Analysis
  dispatch({ type: 'SET_AI_ANALYSIS_STARTED' });
  dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: 'ANALYZING' });

  eventBus.emit('AI_ANALYSIS_STARTED', incident.id, 'NIM_ENGINE');

  const decision = await fetchAIDecision(incident, hospitals.length);

  if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
    return { cancelAll };
  }

  // Step 2: Apply AI Decision
  dispatch({ type: 'SET_AI_DECISION', payload: decision });
  dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: 'ACTIVE' });

  // Initialize Mission Plan Baseline
  const initialPlan: ResponsePlan = {
    version: 1,
    ambulance: { target: incident.id, routeStatus: 'DISPATCHED' },
    police: { target: incident.id, routeStatus: 'DISPATCHED' },
    traffic: { greenCorridor: decision.greenCorridor },
    hospital: { id: null, status: 'NOTIFIED' },
    priorities: decision.requiredAgents,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    status: 'VALID',
    reason: `Initial multi-agent emergency dispatch planned by ${decision.engine}.`,
    actions: decision.requiredAgents.map((ag) => ({
      agent: ag,
      action: `DISPATCH_${ag}`,
      status: 'EXECUTING',
    })),
  };

  const initialMission: Mission = {
    id: `MIS-${incident.id.replace('INC-', '')}`,
    simulationId: simulationGeneration,
    incidentId: incident.id,
    currentPlan: initialPlan,
    planVersion: 1,
    planStatus: 'VALID',
    status: 'EXECUTING',
    replanningCount: 0,
    startedAt: new Date().toISOString(),
    lastEvaluatedAt: new Date().toISOString(),
  };

  const initialOpt = computeMissionOptimization(getState());
  dispatch({
    type: 'SET_MISSION_PLAN',
    payload: { mission: initialMission, plan: initialPlan, optimization: initialOpt },
  });

  eventBus.emit('AI_DECISION_RECEIVED', incident.id, 'NIM_ENGINE', { decision });

  // Milestone 1: AI Decision Completed -> Trigger Predictive Intelligence
  triggerPredictionAnalysis(getState, dispatch, 'AI_DECISION_COMPLETED');

  // Start continuous City Data & Mission Monitoring Loop
  monitorIntervalId = setInterval(async () => {
    if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
      if (monitorIntervalId) clearInterval(monitorIntervalId);
      return;
    }

    const state = getState();
    if (!state.activeIncident || state.activeIncident.status === 'RESOLVED') {
      if (monitorIntervalId) clearInterval(monitorIntervalId);
      return;
    }

    // 1. Refresh City State
    const updatedCity = computeCityState(state);
    dispatch({ type: 'UPDATE_CITY_STATE', payload: updatedCity });

    // 2. Evaluate Active Mission Plan
    const evalResult = evaluateActiveMission(state, state.mission?.currentPlan || null);

    if (!evalResult.valid && state.mission?.planStatus !== 'REPLANNING') {
      dispatch({
        type: 'SET_MISSION_STATUS',
        payload: { status: 'EXECUTING', planStatus: 'REVIEW_REQUIRED' },
      });

      // Request Adaptive Replan from NIM/Fallback
      const replanRec = await fetchReplanRecommendation(state, evalResult.triggers);

      if (isCancelled || getState().simulationGeneration !== simulationGeneration) return;

      if (replanRec.recommendation === 'REPLAN') {
        const nextVersion = (state.mission?.planVersion || 1) + 1;
        const newPlan: ResponsePlan = {
          version: nextVersion,
          ambulance: { target: incident.id, routeStatus: 'DISPATCHED' },
          police: { target: incident.id, routeStatus: 'DISPATCHED' },
          traffic: { greenCorridor: decision.greenCorridor },
          hospital: { id: null, status: 'NOTIFIED' },
          priorities: decision.requiredAgents,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          status: 'ADAPTED',
          reason: replanRec.reason,
          actions: replanRec.changes.map((c) => ({
            agent: c.target,
            action: c.action,
            status: 'EXECUTING',
          })),
        };

        const updatedOpt = computeMissionOptimization(getState());
        dispatch({
          type: 'UPDATE_MISSION_PLAN',
          payload: { plan: newPlan, reason: replanRec.reason, optimization: updatedOpt },
        });

        // Trigger predictive intelligence on replan
        triggerPredictionAnalysis(getState, dispatch, 'REPLAN_EXECUTED');
      } else {
        dispatch({
          type: 'SET_MISSION_STATUS',
          payload: { status: 'EXECUTING', planStatus: 'VALID' },
        });
      }
    }

    // 3. Update Mission Optimization Score
    const currentOpt = computeMissionOptimization(state);
    dispatch({ type: 'UPDATE_OPTIMIZATION', payload: currentOpt });
  }, 3000);

  // Step 3: Run Hospital Agent (if required)
  let selectedHospital: Hospital | null = null;
  if (decision.hospitalRequired || decision.requiredAgents.includes('HOSPITAL')) {
    const hospitalRun = await runHospitalAgent({
      incidentId: incident.id,
      incidentLat: incident.latitude,
      incidentLng: incident.longitude,
      hospitals,
      simulationGeneration,
      dispatch,
      getState: getState as any,
    });
    hospitalCtrl = hospitalRun.controller;
    selectedHospital = hospitalRun.selectedHospital;

    // Milestone 2: Hospital Selected -> Trigger Predictive Intelligence
    if (selectedHospital) {
      triggerPredictionAnalysis(getState, dispatch, 'HOSPITAL_SELECTED');
    }
  }

  if (isCancelled || getState().simulationGeneration !== simulationGeneration) {
    return { cancelAll };
  }

  // Step 4: Run Police Agent (if required)
  if (decision.requiredAgents.includes('POLICE')) {
    policeCtrl = await runPoliceAgent({
      incidentId: incident.id,
      destLat: incident.latitude,
      destLng: incident.longitude,
      depotLat: POLICE_DEPOT.latitude,
      depotLng: POLICE_DEPOT.longitude,
      simulationGeneration,
      dispatch,
      getState: getState as any,
    });
  }

  // Step 5: Run Ambulance Agent Leg 1 (if required)
  if (decision.requiredAgents.includes('AMBULANCE')) {
    ambulanceCtrl = await runAmbulanceAgent({
      incidentId: incident.id,
      destLat: incident.latitude,
      destLng: incident.longitude,
      depotLat: AMBULANCE_DEPOT.latitude,
      depotLng: AMBULANCE_DEPOT.longitude,
      simulationGeneration,
      dispatch,
      getState: getState as any,
      onArrivedAtScene: async () => {
        // When Ambulance arrives at scene, check if hospital transport is needed
        if (isCancelled || getState().simulationGeneration !== simulationGeneration) return;

        dispatch({ type: 'UPDATE_INCIDENT_STATUS', payload: 'RESPONSE_IN_PROGRESS' });

        // Milestone 3: Ambulance Arrived at Scene -> Trigger Predictive Intelligence
        triggerPredictionAnalysis(getState, dispatch, 'AMBULANCE_ARRIVED_SCENE');

        if (selectedHospital) {
          dispatch({
            type: 'ADD_SYSTEM_LOG',
            payload: {
              message: `PATIENT STABILIZED: Ambulance departing scene for ${selectedHospital.name}.`,
              type: 'info',
              source: 'AMBULANCE',
            },
          });

          // Run Ambulance Leg 2 Transport to Hospital
          ambulanceCtrl = await runAmbulanceHospitalTransport({
            incidentId: incident.id,
            startLat: incident.latitude,
            startLng: incident.longitude,
            hospital: selectedHospital,
            simulationGeneration,
            dispatch,
            getState: getState as any,
          });

          // Milestone 4: Hospital Transport Initiated -> Trigger Predictive Intelligence
          triggerPredictionAnalysis(getState, dispatch, 'HOSPITAL_TRANSPORT_STARTED');
        }
      },
    });
  }

  // Step 6: Activate Traffic Green Corridor & Rapid Pilot Unit (if required)
  if (decision.requiredAgents.includes('TRAFFIC') && decision.greenCorridor) {
    setTimeout(async () => {
      if (isCancelled || getState().simulationGeneration !== simulationGeneration) return;
      const currentRoute = getState();
      trafficCtrl = await runTrafficAgent({
        incidentId: incident.id,
        destLat: incident.latitude,
        destLng: incident.longitude,
        ambulanceRoute: currentRoute?.ambulance?.route || [],
        simulationGeneration,
        dispatch,
        getState: getState as any,
      });

      // Milestone 5: Green Corridor Active -> Trigger Predictive Intelligence
      triggerPredictionAnalysis(getState, dispatch, 'GREEN_CORRIDOR_ACTIVATED');
    }, 1200);
  }

  // Step 7: Multi-Department Unified Swarm Activations
  const deptPlan = evaluateDepartmentSelection(incident.id, incident.type, incident.severity);
  
  if (deptPlan.requiredDepartments.includes('FIRE_RESCUE')) {
    fireRescueAgent.dispatchToIncident(incident.id, incident.latitude, incident.longitude);
  }
  if (deptPlan.requiredDepartments.includes('PUBLIC_WORKS')) {
    publicWorksAgent.dispatchToIncident(incident.id, incident.latitude, incident.longitude);
  }
  if (deptPlan.requiredDepartments.includes('ELECTRICITY')) {
    electricityAgent.dispatchToIncident(incident.id, incident.latitude, incident.longitude);
  }
  if (deptPlan.requiredDepartments.includes('WATER_SEWERAGE')) {
    waterSewerageAgent.dispatchToIncident(incident.id, incident.latitude, incident.longitude);
  }
  if (deptPlan.requiredDepartments.includes('DISASTER_MANAGEMENT')) {
    disasterManagementAgent.activateDisasterProtocol(incident.id, deptPlan.escalationLevel);
  }
  if (deptPlan.requiredDepartments.includes('WEATHER_ENV')) {
    weatherEnvironmentAgent.publishWeatherAlert(incident.id, 'ADVERSE_CONDITION_ALERT');
  }
  if (deptPlan.requiredDepartments.includes('EMERGENCY_COMMS')) {
    emergencyCommunicationsAgent.routeCrossDepartmentMessage('COORDINATOR', 'ALL_UNITS', 'Multi-department inter-agency channel opened.', incident.id);
  }
  if (deptPlan.requiredDepartments.includes('CITY_ADMIN')) {
    cityAdministrationAgent.authorizeEmergencyResources(incident.id, deptPlan.escalationLevel);
  }
  if (deptPlan.requiredDepartments.includes('EMS')) {
    emsAgent.dispatchToIncident(incident.id, incident.latitude, incident.longitude);
  }

  return { ambulanceController: ambulanceCtrl, policeController: policeCtrl, hospitalController: hospitalCtrl, cancelAll };
}
