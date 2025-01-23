import { Route, Switch } from "wouter";
import { Home } from "./pages/home";
import { MemPool } from "./pages/mempool";
import { ChainProvider } from "./context/chain";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "./states/atoms";
import { Network } from "./service/type";

const App = () => {
    const chainTheme = useAtomValue(chainThemeAtom);
    return (
        <ChainProvider
            network={
                chainTheme === ChainTheme.mainnet
                    ? Network.Mainnet
                    : Network.Testnet
            }
        >
            <main class={"flex flex-col justify-center bg-surface-DEFAULT-01"}>
                <Switch>
                    <Route path="/" component={Home} />
                </Switch>
                <Switch>
                    <Route path="/mempool" component={MemPool} />
                </Switch>
            </main>
        </ChainProvider>
    );
};

export default App;
