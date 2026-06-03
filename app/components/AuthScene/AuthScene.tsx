import { authGrid, authOrb, authSceneRoot } from "./styles";

export function AuthScene() {
  return (
    <div aria-hidden="true" className={authSceneRoot()}>
      <div className={authGrid()} />
      <div className={authOrb()} />
    </div>
  );
}
