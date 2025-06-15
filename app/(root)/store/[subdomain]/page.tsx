import { headers } from "next/headers";
import Image from "next/image";


export default async function PrivateStores() {
    try {
        const headersList = await headers();
        const host = headersList.get("host");

        if (!host) {
            return <p>Error: Host header is missing</p>;
        }

        const subdomain = host.split(".")[0];

        if (!subdomain || subdomain === "www" || subdomain === "localhost") {
            return <p>Invalid subdomain</p>;
        }

        // Use a secure API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        console.log({apiUrl, subdomain})
        const response = await fetch(`${apiUrl}/api/${subdomain}`, { cache: "no-store" });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Error fetching store data:", errorMessage);
            return <p>Error fetching store data</p>;
        }

        const data = await response.json();
        return (
            <div>
                <h1>Private Stores - Hosted on: {host}</h1>
                <p>{data.storeName}</p>
                <Image src={data.banner} alt="banner" width={400} height={400}/>
                <p>{data.description}</p>
                <p>Address: {data.address}</p>
                <Image src={data.logo} alt="logo" width={400} height={400}/>
                <p>
                    {JSON.stringify(data.products)}
                </p>
            </div>
        );
    } catch (error) {
        console.error("Error:", error);
        return <p>Something went wrong</p>;
    }
}
