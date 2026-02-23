export async function onRequestError(
    error: Error & { digest?: string },
    request: { path: string, method: string; headers: Headers },
    context: {
        routerKind: 'App Router' | 'Page Router';
        routePath: string;
        routeType: 'render' | 'route' | 'action' | 'proxy';
        renderSource: string;
    }
) {
    console.error('[onRequestError]', {
        digest: error.digest,
        message: error.message,
        stack: error.stack,
        path: request.path,
        routePath: context.routePath,
        routeType: context.routeType,
    });
}