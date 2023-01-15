import { F } from "ramda";

export type State<S, A> = (initialState: S) => [S, A];

export const bind= <S, A, B>(state: State<S, A>, f: (x: A) => State<S, B>): State<S, B> =>(initial:S):[S,B]=>f(state(initial)[1])(state(initial)[0])
