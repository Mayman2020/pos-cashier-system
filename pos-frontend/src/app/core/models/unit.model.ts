export interface Unit {
  id: number;
  code: string;
  name: string;
  symbol?: string;
}

export interface UnitRequest {
  code: string;
  name: string;
  symbol?: string;
}
