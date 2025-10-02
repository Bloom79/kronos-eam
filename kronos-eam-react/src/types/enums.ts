export enum WorkflowCategoryEnum {
  ACTIVATION = "Activation",
  FISCAL = "Fiscal",
  INCENTIVES = "Incentives",
  CHANGES = "Changes",
  MAINTENANCE = "Maintenance",
  COMPLIANCE = "Compliance",
}

export enum WorkflowStatusEnum {
  DRAFT = "Draft",
  ACTIVE = "Active",
  PAUSED = "Paused",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum TaskStatusEnum {
  TO_START = "To Start",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  DELAYED = "Delayed",
  BLOCKED = "Blocked",
}

export enum TaskPriorityEnum {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum EntityEnum {
  DSO = "DSO",
  TERNA = "Terna",
  GSE = "GSE",
  CUSTOMS = "Customs",
  MUNICIPALITY = "Municipality",
  REGION = "Region",
  SUPERINTENDENCE = "Superintendence",
}

export enum PlantTypeEnum {
  PHOTOVOLTAIC = "Photovoltaic",
  WIND = "Wind",
  HYDROELECTRIC = "Hydroelectric",
  BIOMASS = "Biomass",
}

export enum PlantStatusEnum {
  IN_OPERATION = "In Operation",
  IN_AUTHORIZATION = "In Authorization",
  IN_CONSTRUCTION = "In Construction",
  DECOMMISSIONED = "Decommissioned",
}
