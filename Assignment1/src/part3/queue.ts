import * as R from "ramda";
import { State, bind } from "./state";

export type Queue = number[];

export const enqueue = (x: number):State<Queue,undefined>=>(queue:Queue)=>[R.insert(queue.length,x,queue),undefined]

export const dequeue:State<Queue,number> = (queue:Queue):[Queue,number] =>[R.remove(0,1,queue),queue[0]]

export const queueManip = (queue:Queue):[Queue,number]=> bind(dequeue,(x:number)=>(bind(enqueue(x*2),(u:undefined)=>bind(enqueue(x/3),(u:undefined)=>dequeue))))(queue)
