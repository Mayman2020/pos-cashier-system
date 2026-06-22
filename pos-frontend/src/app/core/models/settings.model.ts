export interface SettingsResponse {
  settings: Record<string, string>;
}

export interface SettingsUpdateRequest {
  settings: Record<string, string>;
}
