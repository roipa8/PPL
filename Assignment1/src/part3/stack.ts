import { State, bind } from "./state";
import * as R from "ramda";

export type Stack = number[];

export const push =  (x: number):State<Stack,undefined>=>(stack:Stack)=>[R.insert(0,x,stack),undefined]

export const pop:State<Stack,number> = (stack:Stack):[Stack,number] =>[R.remove(0,1,stack),stack[0]]

export const stackManip = (stack:Stack):[Stack,undefined]=> bind(pop,(x:number)=>(bind(push(x*x),(u:undefined)=>bind(pop,(y:number)=>push(x+y)))))(stack)
