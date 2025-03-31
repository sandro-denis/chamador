import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSenha } from '../context/SenhaContext'

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 30px;
  color: #2c3e50;
  position: relative;
  padding-bottom: 15px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 3px;
  }
`

const FiltersContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 20px;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
  }
`

const DateInput = styled.input`
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2);
    transform: translateY(-2px);
  }
  
  &:hover {
    border-color: #bbb;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`

const StatCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
  }
`

const StatTitle = styled.h3`
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 18px;
  position: relative;
  padding-bottom: 10px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 2px;
  }
`

const StatValue = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const StatUnit = styled.span`
  font-size: 16px;
  color: #7f8c8d;
  margin-left: 5px;
`

const Estatisticas = () => {
  const { getSenhasPorStatus } = useSenha()
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [estatisticas, setEstatisticas] = useState({
    totalSenhas: 0,
    totalAtendidas: 0,
    senhasExpiradas: 0,
    tempoMedioEspera: 0,
    tempoMedioAtendimento: 0,
    tempoMaximoEspera: 0,
    tempoMinimoEspera: 0
  })

  const calcularEstatisticas = () => {
    // Buscar senhas finalizadas em vez de atendidas (status correto)
    const senhasAtendidas = getSenhasPorStatus('finalizada')
    const senhasChamadas = getSenhasPorStatus('chamada')
    const senhasAguardando = getSenhasPorStatus('aguardando')
    
    const todasSenhas = [...senhasAtendidas, ...senhasChamadas, ...senhasAguardando]
    
    // Filtra por período se as datas estiverem definidas
    const senhasFiltradas = todasSenhas.filter(senha => {
      if (!dataInicio && !dataFim) return true
      
      const dataSenha = new Date(senha.horarioGeracao)
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim) : null
      
      if (inicio && fim) {
        return dataSenha >= inicio && dataSenha <= fim
      } else if (inicio) {
        return dataSenha >= inicio
      } else if (fim) {
        return dataSenha <= fim
      }
      
      return true
    })
    
    // Calcula tempos de espera e atendimento
    const temposEspera = senhasAtendidas
      .filter(senha => senha.horarioGeracao && senha.horarioChamada)
      .map(senha => {
        const geracao = new Date(senha.horarioGeracao)
        const chamada = new Date(senha.horarioChamada)
        
        // Verifica se as datas são válidas
        if (isNaN(geracao.getTime()) || isNaN(chamada.getTime())) {
          return null
        }
        
        return (chamada - geracao) / 1000 / 60 // em minutos
      })
      .filter(tempo => tempo !== null) // Remove tempos inválidos
    
    const temposAtendimento = senhasAtendidas
      .filter(senha => senha.horarioChamada && senha.horarioFinalizacao)
      .map(senha => {
        const chamada = new Date(senha.horarioChamada)
        const finalizacao = new Date(senha.horarioFinalizacao)
        
        // Verifica se as datas são válidas
        if (isNaN(chamada.getTime()) || isNaN(finalizacao.getTime())) {
          return null
        }
        
        return (finalizacao - chamada) / 1000 / 60 // em minutos
      })
      .filter(tempo => tempo !== null) // Remove tempos inválidos
    
    // Calcula médias e extremos apenas com valores válidos
    const mediaEspera = temposEspera.length > 0
      ? temposEspera.reduce((a, b) => a + b, 0) / temposEspera.length
      : 0
    
    const mediaAtendimento = temposAtendimento.length > 0
      ? temposAtendimento.reduce((a, b) => a + b, 0) / temposAtendimento.length
      : 0
    
    setEstatisticas({
      totalSenhas: senhasFiltradas.length,
      totalAtendidas: senhasAtendidas.length,
      senhasExpiradas: senhasAguardando.filter(senha => {
        const tempoEspera = (new Date() - new Date(senha.horarioGeracao)) / 1000 / 60
        return tempoEspera > 30 // considera expirada após 30 minutos
      }).length,
      tempoMedioEspera: mediaEspera.toFixed(1),
      tempoMedioAtendimento: mediaAtendimento.toFixed(1),
      tempoMaximoEspera: Math.max(...temposEspera, 0).toFixed(1),
      tempoMinimoEspera: Math.min(...temposEspera, 0).toFixed(1)
    })
  }

  // Atualiza as estatísticas quando as datas mudam
  useEffect(() => {
    calcularEstatisticas()
    const interval = setInterval(calcularEstatisticas, 30000) // atualiza a cada 30 segundos
    return () => clearInterval(interval)
  }, [dataInicio, dataFim])

  return (
    <Container>
      <Title>Estatísticas de Atendimento</Title>
      
      <FiltersContainer>
        <DateInput
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          placeholder="Data Início"
        />
        <DateInput
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          placeholder="Data Fim"
        />
      </FiltersContainer>
      
      <StatsGrid>
        <StatCard>
          <StatTitle>Total de Senhas Emitidas</StatTitle>
          <StatValue>{estatisticas.totalSenhas}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Atendimentos Concluídos</StatTitle>
          <StatValue>{estatisticas.totalAtendidas}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Senhas Expiradas</StatTitle>
          <StatValue>{estatisticas.senhasExpiradas}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Tempo Médio de Espera</StatTitle>
          <StatValue>
            {estatisticas.tempoMedioEspera}
            <StatUnit>min</StatUnit>
          </StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Tempo Médio de Atendimento</StatTitle>
          <StatValue>
            {estatisticas.tempoMedioAtendimento}
            <StatUnit>min</StatUnit>
          </StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Tempo Máximo de Espera</StatTitle>
          <StatValue>
            {estatisticas.tempoMaximoEspera}
            <StatUnit>min</StatUnit>
          </StatValue>
        </StatCard>
      </StatsGrid>
    </Container>
  )
}

export default Estatisticas