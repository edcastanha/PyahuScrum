/**
 * ElicitacaoCard.test.tsx — TDD E3-T13 (ticket #30)
 *
 * Spec: specs/004-elicitacao-interativa/spec.md (CA-2, CA-3, CA-6)
 * Testa o componente de card de elicitação isoladamente.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ElicitacaoCard from './ElicitacaoCard';

const PERGUNTA_BASE = {
  id: 'q1',
  texto: 'Qual a stack de backend?',
  opcoes: ['Python/FastAPI', 'Node/Express', 'Java/Spring'],
  permite_texto: true,
};

describe('ElicitacaoCard', () => {
  describe('renderização', () => {
    it('exibe o texto da pergunta', () => {
      render(
        <ElicitacaoCard
          pergunta={PERGUNTA_BASE}
          onResposta={jest.fn()}
        />
      );
      expect(screen.getByText('Qual a stack de backend?')).toBeInTheDocument();
    });

    it('exibe todas as opções como botões', () => {
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={jest.fn()} />);
      expect(screen.getByText('Python/FastAPI')).toBeInTheDocument();
      expect(screen.getByText('Node/Express')).toBeInTheDocument();
      expect(screen.getByText('Java/Spring')).toBeInTheDocument();
    });

    it('exibe textarea quando permite_texto é true', () => {
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={jest.fn()} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('não exibe textarea quando permite_texto é false', () => {
      const pergunta = { ...PERGUNTA_BASE, permite_texto: false };
      render(<ElicitacaoCard pergunta={pergunta} onResposta={jest.fn()} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('sem opções: não exibe botões de opção', () => {
      const pergunta = { ...PERGUNTA_BASE, opcoes: [] };
      render(<ElicitacaoCard pergunta={pergunta} onResposta={jest.fn()} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('interação — seleção de opção', () => {
    it('chama onResposta com opcao ao clicar', () => {
      const onResposta = jest.fn();
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={onResposta} />);
      fireEvent.click(screen.getByText('Python/FastAPI'));
      expect(onResposta).toHaveBeenCalledWith('q1', 'Python/FastAPI', undefined);
    });

    it('marca visualmente a opção selecionada', () => {
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={jest.fn()} />);
      const btn = screen.getByText('Python/FastAPI');
      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('desseleciona a opção anterior ao selecionar outra', () => {
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={jest.fn()} />);
      fireEvent.click(screen.getByText('Python/FastAPI'));
      fireEvent.click(screen.getByText('Node/Express'));
      expect(screen.getByText('Python/FastAPI')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('Node/Express')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('interação — campo de texto', () => {
    it('chama onResposta com texto ao digitar', () => {
      const onResposta = jest.fn();
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={onResposta} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'com alembic' } });
      expect(onResposta).toHaveBeenCalledWith('q1', undefined, 'com alembic');
    });

    it('chama onResposta com opcao e texto ao ter ambos', () => {
      const onResposta = jest.fn();
      render(<ElicitacaoCard pergunta={PERGUNTA_BASE} onResposta={onResposta} />);
      fireEvent.click(screen.getByText('Python/FastAPI'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'detalhe' } });
      // Último call deve ter opcao + texto
      const lastCall = onResposta.mock.calls[onResposta.mock.calls.length - 1];
      expect(lastCall[1]).toBe('Python/FastAPI');
      expect(lastCall[2]).toBe('detalhe');
    });
  });
});
