const BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export type Service={id:string;title:string;description:string;price:string;duration:number;image?:string;category:{id:string;name:string};provider:{name:string};reviews:{rating:number}[]};
export type Category={id:string;name:string;icon?:string};
export async function api<T>(path:string,options:RequestInit={}){const token=localStorage.getItem('token');const res=await fetch(BASE+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...options.headers}});const json=await res.json();if(!res.ok)throw new Error(json.message||'Something went wrong');return json.data as T}
