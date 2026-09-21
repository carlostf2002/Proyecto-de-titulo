import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordDemo = await bcrypt.hash("Habita2026!", 12);

  const condominio = await prisma.condominio.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      nombre: "Condominio Los Alerces",
      direccion: "Av. Siempre Viva 742",
      comuna: "Providencia",
    },
  });

  const torre = await prisma.torre.create({
    data: { condominioId: condominio.id, nombre: "Torre A" },
  });

  const departamento = await prisma.departamento.create({
    data: { condominioId: condominio.id, torreId: torre.id, numero: "101" },
  });

  await prisma.usuario.upsert({
    where: { email: "admin@habitasmart.cl" },
    update: {},
    create: {
      condominioId: condominio.id,
      email: "admin@habitasmart.cl",
      passwordHash: passwordDemo,
      nombre: "Ana",
      apellido: "Administradora",
      rol: Rol.ADMIN,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "residente@habitasmart.cl" },
    update: {},
    create: {
      condominioId: condominio.id,
      email: "residente@habitasmart.cl",
      passwordHash: passwordDemo,
      nombre: "Roberto",
      apellido: "Residente",
      rol: Rol.RESIDENTE,
      departamentoId: departamento.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "conserje@habitasmart.cl" },
    update: {},
    create: {
      condominioId: condominio.id,
      email: "conserje@habitasmart.cl",
      passwordHash: passwordDemo,
      nombre: "Carlos",
      apellido: "Conserje",
      rol: Rol.CONSERJE,
    },
  });

  await prisma.espacioComun.createMany({
    data: [
      {
        condominioId: condominio.id,
        nombre: "Quincho",
        descripcion: "Espacio con parrilla para eventos familiares.",
        capacidad: 20,
        horarioInicio: "10:00",
        horarioFin: "23:00",
      },
      {
        condominioId: condominio.id,
        nombre: "Sala de eventos",
        descripcion: "Salon multiuso con capacidad para reuniones.",
        capacidad: 30,
        horarioInicio: "09:00",
        horarioFin: "22:00",
      },
    ],
  });

  console.log("Seed completado. Usuarios de prueba (password: Habita2026!):");
  console.log(" - admin@habitasmart.cl (ADMIN)");
  console.log(" - residente@habitasmart.cl (RESIDENTE)");
  console.log(" - conserje@habitasmart.cl (CONSERJE)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
