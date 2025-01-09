import { ClientPublicMainnet, ClientPublicTestnet } from "@ckb-ccc/core";

export async function printPeers(
    client: ClientPublicTestnet | ClientPublicMainnet,
) {
    const getPeers = client.buildSender("get_peers", []);
    const peers = await getPeers();
    for (const peer of peers as any) {
        console.log(peer.addresses[0]);
    }
}

export async function main() {
    const newClient = new ClientPublicTestnet({
        url: "http://39.104.177.87:8111",
    });
    const mainClient = new ClientPublicMainnet({
        url: "http://34.64.120.143:8114",
    });
    const client = new ClientPublicTestnet();

    await printPeers(mainClient);
}
