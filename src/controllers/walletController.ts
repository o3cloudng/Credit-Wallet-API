import { Request, Response } from 'express';
import knex from '../db.js';
import { toKobo, fromKobo } from '../utils/money.js';

export async function getWallet(req: Request, res: Response) {
  if (!req.user) {
    return res.status(400).json({ error: 'User not authenticated' });
  }
  const userId = req.user!.id;
  const wallet = await knex('wallets').where({ user_id: userId }).first();
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json({ balance: fromKobo(Number(wallet.balance_kobo)) });
}

export async function fund(req: Request, res: Response) {
  if (!req.user) {
    return res.status(400).json({ error: 'User not authenticated' });
  }
  const userId = req.user!.id;
  // console.log("USER ID: " + userId)
  if (!req.body) {
    return res.status(400).json({ error: 'Empty payload.' });
  }
  const { amount } = req.body;

  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const balanceKobo = toKobo(Number(amount));

  const result = await knex.transaction(async (trx) => {
    const wallet = await trx('wallets').where({ user_id: userId }).forUpdate().first();
    if (!wallet) throw { status: 404, message: 'Wallet not found' };
    const newBal = Number(wallet.balance_kobo) + balanceKobo;
    await trx('wallets').where({ id: wallet.id }).update({ balance_kobo: newBal, updated_at: trx.fn.now() });
    await trx('transactions').insert({ wallet_id: wallet.id, type: 'fund', amount_kobo: balanceKobo, metadata: JSON.stringify({}) });
    const updated = await trx('wallets').where({ id: wallet.id }).first();
    return updated;
  });

  res.json({ balance: fromKobo(Number(result.balance_kobo)) });
}

export async function withdraw(req: Request, res: Response) {
  if (!req.user) {
    return res.status(400).json({ error: 'User not authenticated' });
  }
  if (!req.body) {
    return res.status(400).json({ error: 'Empty payload' });
  }
  const userId = req.user!.id;
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const amountWithdrawKobo = toKobo(Number(amount));

  const result = await knex.transaction(async (trx) => {
    const wallet = await trx('wallets').where({ user_id: userId }).forUpdate().first();
    // if (!wallet) throw { status: 404, message: 'Wallet not found' };
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    // if (Number(wallet.balance_kobo) < amountWithdrawKobo) throw { status: 400, message: 'Insufficient funds' };
    if (Number(wallet.balance_kobo) < amountWithdrawKobo) {
      return res.status(400).json({ error: 'Insufficient funds' });
    };
    const newBal = Number(wallet.balance_kobo) - amountWithdrawKobo;
    await trx('wallets').where({ id: wallet.id }).update({ balance_kobo: newBal, updated_at: trx.fn.now() });
    await trx('transactions').insert({ wallet_id: wallet.id, type: 'withdraw', amount_kobo: -amountWithdrawKobo, metadata: JSON.stringify({}) });
    const updated = await trx('wallets').where({ id: wallet.id }).first();
    return updated;
  });

  res.json({ balance: fromKobo(Number(result.balance_kobo)) });
}

export async function transfer(req: Request, res: Response) {
  const fromUserId = req.user!.id;
  if (!req.body) {
    return res.status(400).json({ error: 'Empty payload.' });
  }
  const { toUserId, amount } = req.body;
  if (!toUserId || !amount) return res.status(400).json({ error: 'Missing fields' });
  if (toUserId === fromUserId) return res.status(400).json({ error: 'Cannot transfer to self' });
  const balanceKobo = toKobo(Number(amount));
  if (balanceKobo <= 0) return res.status(400).json({ error: 'Amount must be > 0' });

  try {
    const result = await knex.transaction(async (trx) => {
      const fromWallet = await trx('wallets').where({ user_id: fromUserId }).forUpdate().first();
      const toWallet = await trx('wallets').where({ user_id: toUserId }).forUpdate().first();
      if (!fromWallet || !toWallet) throw { status: 404, message: 'Wallet not found' };
      if (Number(fromWallet.balance_kobo) < balanceKobo) throw { status: 400, message: 'Insufficient funds' };

      await trx('wallets').where({ id: fromWallet.id }).update({ balance_kobo: Number(fromWallet.balance_kobo) - balanceKobo, updated_at: trx.fn.now() });
      await trx('wallets').where({ id: toWallet.id }).update({ balance_kobo: Number(toWallet.balance_kobo) + balanceKobo, updated_at: trx.fn.now() });

      await trx('transactions').insert([
        { wallet_id: fromWallet.id, type: 'transfer_out', amount_kobo: -balanceKobo, metadata: JSON.stringify({ toUserId }) },
        { wallet_id: toWallet.id, type: 'transfer_in', amount_kobo: balanceKobo, metadata: JSON.stringify({ fromUserId }) }
      ]);

      const updatedFrom = await trx('wallets').where({ id: fromWallet.id }).first();
      const updatedTo = await trx('wallets').where({ id: toWallet.id }).first();
      return { from: updatedFrom, to: updatedTo };
    });

    res.json({ 
      fromUserId, 
      toUserId, 
      amount: Number(amount), 
      // toBalance: fromKobo(Number(result.to.balance_kobo)),
      fromBalance: fromKobo(Number(result.from.balance_kobo))
     });
  } catch (err: any) {
    if (err?.status) return res.status(err.status).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
