import { DepartmentId } from '../data/departments';

export type DepartmentAgentStatus =
  | 'AVAILABLE'
  | 'STANDBY'
  | 'DISPATCHED'
  | 'RESPONDING'
  | 'ON_SCENE'
  | 'WORKING'
  | 'WAITING'
  | 'COMPLETED'
  | 'RETURNING'
  | 'UNAVAILABLE'
  | 'DEGRADED';

export interface DepartmentAgentState {
  id: string;
  department: DepartmentId;
  status: DepartmentAgentStatus;
  currentTask: string;
  location: [number, number]; // [lat, lng]
  destinationLocation?: [number, number] | null;
  availability: boolean;
  assignedIncident: string | null;
  capabilities: string[];
  route?: [number, number][];
  routeDistanceMeters?: number;
  routeDurationSeconds?: number;
  etaSeconds?: number | null;
  lastUpdated: string;
}

export interface IDepartmentAgent {
  id: string;
  department: DepartmentId;
  getState(): DepartmentAgentState;
  activate(incidentId: string, task: string, location?: [number, number]): void;
  assignTask(task: string): void;
  updateStatus(status: DepartmentAgentStatus, task?: string): void;
  completeTask(): void;
  release(): void;
  reportEvent(eventType: string, message: string): void;
}

export class BaseDepartmentAgent implements IDepartmentAgent {
  public id: string;
  public department: DepartmentId;
  protected state: DepartmentAgentState;

  constructor(id: string, department: DepartmentId, initialLoc: [number, number], capabilities: string[]) {
    this.id = id;
    this.department = department;
    this.state = {
      id,
      department,
      status: 'AVAILABLE',
      currentTask: 'STANDBY',
      location: initialLoc,
      destinationLocation: null,
      availability: true,
      assignedIncident: null,
      capabilities,
      lastUpdated: new Date().toISOString(),
    };
  }

  public getState(): DepartmentAgentState {
    return { ...this.state };
  }

  public activate(incidentId: string, task: string, destLoc?: [number, number]): void {
    this.state.assignedIncident = incidentId;
    this.state.currentTask = task;
    this.state.status = 'DISPATCHED';
    this.state.availability = false;
    if (destLoc) {
      this.state.destinationLocation = destLoc;
    }
    this.state.lastUpdated = new Date().toISOString();
  }

  public assignTask(task: string): void {
    this.state.currentTask = task;
    this.state.lastUpdated = new Date().toISOString();
  }

  public updateStatus(status: DepartmentAgentStatus, task?: string): void {
    this.state.status = status;
    if (task) this.state.currentTask = task;
    this.state.lastUpdated = new Date().toISOString();
  }

  public completeTask(): void {
    this.state.status = 'COMPLETED';
    this.state.currentTask = 'TASK_COMPLETED';
    this.state.lastUpdated = new Date().toISOString();
  }

  public release(): void {
    this.state.status = 'AVAILABLE';
    this.state.currentTask = 'STANDBY';
    this.state.assignedIncident = null;
    this.state.destinationLocation = null;
    this.state.availability = true;
    this.state.route = undefined;
    this.state.lastUpdated = new Date().toISOString();
  }

  public reportEvent(eventType: string, message: string): void {
    // Custom event reporting hook
  }
}
