import { Route, Switch } from "wouter";
import { Home } from "./pages/home";

const App = () => {
    return (
        <div>
            <main class={"flex flex-col justify-center bg-surface-DEFAULT-01"}>
                <Switch>
                    <Route path="/" component={Home} />
                </Switch>
            </main>
        </div>
    );
};

export default App;
