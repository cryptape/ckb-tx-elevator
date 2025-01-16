import Pool from "../components/pool";
import PoolGround from "../components/pool-ground";
import BaseLayout from "../layouts/base";

export function MemPool() {
    return (
        <BaseLayout>
            <Pool />
            <PoolGround />
        </BaseLayout>
    );
}
