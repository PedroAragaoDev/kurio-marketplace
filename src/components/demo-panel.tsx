import { useState } from 'react'
import { z } from 'zod'
import { api } from '../lib/api'
import { queryClient } from '../lib/query'
import { disconnectSocket, reconnectSocket } from '../hooks/realtime'
import { useNotice } from './feedback'
import { Button } from './ui/button'

const success = z.object({ success: z.boolean() })
export function DemoPanel({ connected }: { connected: boolean }) {
  const notice = useNotice(); const [scenario, setScenario] = useState('standard')
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return null
  const action = async (name: string) => {
    const result = await api('/demo/action', success, 'POST', { action: name })
    if (!result.ok) notice(result.error.message)
  }
  return <details open className="demo-panel"><summary>Demonstração · {connected ? 'conectado' : 'desconectado'}</summary><div className="demo-content">
    <p>Dados fictícios. Nenhuma compra utiliza dinheiro ou blockchain.</p>
    <label htmlFor="scenario">Cenário de rede e pagamento</label><select id="scenario" value={scenario} onChange={async (event) => {
      const value = event.target.value; setScenario(value)
      await api('/demo', success, 'PUT', { scenario: value }); void queryClient.invalidateQueries()
    }}><option value="standard">Padrão</option><option value="slow">Lentidão</option><option value="out-of-order">Respostas fora de ordem</option><option value="offline">Falha de conexão</option><option value="server-error">Erro HTTP 503</option><option value="session-expired">Sessão expirada</option><option value="signup-conflict">Conflito de cadastro</option><option value="favorite-error">Falha ao favoritar</option><option value="payment-refused">Pagamento recusado</option><option value="order-timeout">Timeout após criar pedido</option><option value="pending">Pedido pendente</option></select>
    <div className="demo-actions"><Button variant="outline" onClick={() => void action('price')}>Alterar preço</Button><Button variant="outline" onClick={() => void action('stock')}>Esgotar edição</Button><Button variant="outline" onClick={() => void action('duplicate')}>Evento duplicado</Button><Button variant="outline" onClick={() => void action('old')}>Evento antigo</Button><Button variant="outline" onClick={() => void action('expire')}>Expirar sessão</Button><Button variant="outline" onClick={() => void action('settle')}>Concluir pendente</Button><Button variant="outline" onClick={disconnectSocket}>Desconectar</Button><Button variant="outline" onClick={reconnectSocket}>Reconectar</Button><Button onClick={async () => { await api('/demo/reset', success, 'POST'); sessionStorage.clear(); location.assign('/') }}>Restaurar demonstração</Button></div>
  </div></details>
}
