export default function DashboardUserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <h1>Dashboard User Layout</h1>
            {children}
        </div>
    );
}