import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { client } from "@/client"
const ConnButton = () => {
    return (
        <div>
            <ConnectButton
                client={client}
                theme={darkTheme({
                    colors: {
                        accentText: "hsl(216, 100%, 60%)",
                        borderColor: "hsl(229, 11.70%, 64.90%)",
                        primaryText: "hsl(240, 100.00%, 97.50%)",
                        secondaryIconColor: "hsl(251, 4%, 50%)",
                    },
                })}
                appMetadata={{
                    name: "Example app",
                    url: "https://example.com",
                }}
            />
        </div>
    )
}

export default ConnButton