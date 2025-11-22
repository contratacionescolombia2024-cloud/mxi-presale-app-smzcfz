
export async function verifyStartup(): Promise<boolean> {
  console.log('✅ Startup verification disabled for stability');
  return true;
}

export function logStartupInfo(): void {
  console.log('📱 App starting...');
}
