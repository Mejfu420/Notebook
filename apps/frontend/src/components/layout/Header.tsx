import { UserButton } from "@clerk/nextjs";

export default function Header() {
    return (
        <header className="main-header">
            <div className="logo-brand">
                Red<span className="highlight">Notes</span>
            </div>
            <UserButton afterSignOutUrl="/" />
        </header>
    );
}