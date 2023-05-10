import { PrismaClient, type Pass } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTicket(id: string): Promise<Pass | null> {
	return await prisma.pass.findUnique({
		where: {
			id: id
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
