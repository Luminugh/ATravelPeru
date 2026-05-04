// Application Use Case - Admin Logout
// Clears session tokens

export class LogoutUseCase {
  execute(): void {
    // No-op: Token deletion is handled by the HTTP layer (cookies)
    // This use case exists for consistency and future extensibility
  }
}
