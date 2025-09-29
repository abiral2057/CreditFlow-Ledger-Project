export function Spinner({ className }: { className?: string }) {
    return (
        <div
            className={`animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-primary border-r-primary/50 border-b-primary/50 border-l-primary/50 ${className}`}
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
