export async function constructBackendUrl(path: string): Promise<string> {
    const { protocol, hostname } = window.location;
    const backendPort = import.meta.env.VITE_BACKEND_PORT;
    return `${protocol}//${hostname}:${backendPort}${path}`;
}