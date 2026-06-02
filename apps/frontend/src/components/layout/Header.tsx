export default function Header() {
    return (
        <header className="layout-header">
            <img src="/images/logo.svg" alt="赤记 | RedNotes" />
            <ul>
                <li><a href="#">Notebooks</a></li>
                <li><a href="#">Settings</a></li>
            </ul>
            <a href=""><img src="/images/user-icon.svg" alt="User" /></a>
        </header>
    );
}