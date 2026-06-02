export default function Container({ children, id, className }: { children: React.ReactNode; id?: string, className?: string }) {
    return <div id={id} className={`layout-container ${className || ''}`}>{children}</div>;
}