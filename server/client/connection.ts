import { createWebSocketClient } from "@khankudo/kisdb/client/websocket"
import { getToken } from "@khankudo/kisdb/core/management"
import type { KisDB } from "../src/db"
import { createHttpClient } from "@khankudo/kisdb/client/http"
import type { KCPHandle, StripFuncsCtx } from "@khankudo/kisdb"

let connListener: ((state: boolean) => void) | null = null
export function isConnected(listener: (state: boolean) => void) {
  connListener = listener
}

const accounts: Record<string, { token: string }> = {}

const stored = sessionStorage.getItem('accounts')
if (stored)
  Object.assign(accounts, JSON.parse(stored))

export function addAccount(username: string, token: string) {
  if (accounts[username] !== undefined)
    accounts[username].token = token
  else
    accounts[username] = { token }

  sessionStorage.setItem('accounts', JSON.stringify(accounts))

  const btn = document.createElement('button')
  btn.innerText = username
  btn.id = 'user-' + username
  btn.onclick = () => selectUser(username)
  document.querySelector('#accounts')?.appendChild(btn)
}

let active = ''
const ctx = { token: '' }
setTimeout(() => {
  const act = sessionStorage.getItem('active') || 'anonymous'
  if (typeof act === 'string' && act !== active)
    selectUser(act)
}, 100)

const proto = new URL(window.location.href).searchParams.get('proto') as Proto ?? 'http'
document.getElementById('proto')!.innerText = proto

type Proto = 'http' | 'ws' // | 'mqtt'

export const client = proto === 'http' ?
  createHttpClient<KisDB>(undefined, ctx, ok => connListener?.(ok))
  : proto === 'ws' ?
    createWebSocketClient<KisDB>(undefined, ctx, ok => connListener?.(ok))
    : // as default fallback, use WebSocket
    null as unknown as KCPHandle<StripFuncsCtx<KisDB>>

if (client === null) {
  document.getElementById('proto')!.innerText = 'UNSUPPORTED PROTOCOL'
  document.getElementById('proto')!.style.filter = 'hue-rotate(180deg)'
  throw new Error('!!! UNSUPPORTED PROTOCOL !!!')
}

export async function login(username: string, password: string) {
  const lastToken = ctx.token
  ctx.token = ''
  const token = await getToken(client, username, password, accounts[username]?.token)
  ctx.token = lastToken
  addAccount(username, token)
}
//@ts-ignore
window.login = login

export function selectUser(username: string) {
  if (username === active)
    return

  if (!accounts[username])
    throw new Error('User Account has not been registered!')

  document.querySelector('#user-' + active)?.classList.remove('active')
  document.querySelector('#user-' + username)?.classList.add('active')

  Object.assign(ctx, accounts[username])
  active = username
  sessionStorage.setItem('active', active)
}
//@ts-ignore
window.selectUser = selectUser