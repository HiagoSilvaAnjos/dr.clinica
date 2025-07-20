// Importa funções necessárias do Drizzle ORM
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

//
// TABELA USERS (usuários do sistema)
//
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// RELACIONAMENTO: usuários podem estar vinculados a várias clínicas
export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

//
// TABELA CLINICS (clínicas)
//
export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(), // ID da clínica
  name: text("name").notNull(), // Nome da clínica (obrigatório)
  createdAt: timestamp("created_at").defaultNow().notNull(), // Data de criação (default: agora)
  updatedAt: timestamp("updated_at") // Data de atualização
    .defaultNow()
    .$onUpdate(() => new Date()), // Atualiza automaticamente ao modificar
});

// RELACIONAMENTO: uma clínica pode ter múltiplos médicos, pacientes, agendamentos e usuários
export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

//
// TABELA USERS_TO_CLINICS (relação N:N entre usuários e clínicas)
//
export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id), // Referência para o usuário
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id), // Referência para a clínica
  createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp de criação
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Atualiza automaticamente
});

// RELACIONAMENTOS da tabela intermediária de vínculo entre usuário e clínica
export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

//
// ENUM DE SEXO DO PACIENTE
//
export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

//
// TABELA DOCTORS (médicos)
//
export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(), // ID único do médico
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }), // Clínica à qual o médico pertence
  name: text("name").notNull(), // Nome do médico
  avatarImageUrl: text("avatar_image_url"), // URL do avatar (opcional)
  availableFromWeekDay: integer("available_from_week_day").notNull(), // Dia da semana inicial (1=segunda, ..., 0=domingo)
  availableToWeekDay: integer("available_to_week_day").notNull(), // Dia da semana final
  availableFromTime: time("available_from_time").notNull(), // Horário inicial disponível
  availableToTime: time("available_to_time").notNull(), // Horário final disponível
  specialty: text("specialty").notNull(), // Especialidade do médico
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(), // Preço da consulta (em centavos)
  createdAt: timestamp("created_at").defaultNow().notNull(), // Criado em
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Atualizado em
});

// RELACIONAMENTOS: médico pertence a uma clínica e pode ter muitos agendamentos
export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

//
// TABELA PATIENTS (pacientes)
//
export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(), // ID do paciente
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }), // Clínica vinculada
  name: text("name").notNull(), // Nome do paciente
  email: text("email").notNull(), // Email do paciente
  phoneNumber: text("phone_number").notNull(), // Telefone
  createdAt: timestamp("created_at").defaultNow().notNull(), // Criado em
  sex: patientSexEnum("sex").notNull(), // Sexo (enum)
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Atualizado em
});

// RELACIONAMENTOS: paciente pertence a uma clínica e pode ter agendamentos
export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

//
// TABELA APPOINTMENTS (agendamentos de consultas)
//
export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(), // ID da consulta
  date: timestamp("date").notNull(), // Data e hora da consulta
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }), // Clínica vinculada
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }), // Paciente
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }), // Médico
  createdAt: timestamp("created_at").defaultNow().notNull(), // Criado em
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Atualizado em
});

// RELACIONAMENTOS: agendamento pertence a um médico, paciente e clínica
export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);
