import { PrismaClient, type Pass } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function addTicket(party: string, payment_id: string): Promise<Pass> {
	const { id } = await prisma.pass.create({
		data: {
			party,
			hash: ''
		}
	});

	return await prisma.pass.update({
		where: {
			id
		},
		data: {
			hash: await bcrypt.hash(id + party, await bcrypt.genSalt(10))
		}
	});
}

export async function getTicket(id: string): Promise<Pass | null> {
	return await prisma.pass.findUnique({
		where: {
			id
		}
	});
}

export async function useTicket(id: string): Promise<void> {
	await prisma.pass.update({
		where: {
			id
		},
		data: {
			used: true
		}
	});
}
