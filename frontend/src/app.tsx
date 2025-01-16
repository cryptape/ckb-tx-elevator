import { Route, Switch } from "wouter";
import { Home } from "./pages/home";
import { MemPool } from "./pages/mempool";

const App = () => {
    return (
        <div>
            <main class={"flex flex-col justify-center bg-surface-DEFAULT-01"}>
                <Switch>
                    <Route path="/" component={Home} />
                </Switch>
                <Switch>
                    <Route path="/mempool" component={MemPool} />
                </Switch>
            </main>
        </div>
    );
};

export default App;
