export default function SignOut() {
    return (
        <form method="post" action="/api/auth/signout">
            <button type="submit">Sign Out</button>
        </form>
    )
}