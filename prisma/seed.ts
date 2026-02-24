import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

async function main() {
  const permissions = [
    { name: "students:create", description: "Create student records" },
    { name: "students:read", description: "View student records" },
    { name: "students:update", description: "Edit student records" },
    { name: "students:delete", description: "Delete student records" },
    { name: "dormitories:create", description: "Create dormitories" },
    { name: "dormitories:read", description: "View dormitories" },
    { name: "dormitories:update", description: "Edit dormitories" },
    { name: "dormitories:delete", description: "Delete dormitories" },
    { name: "fees:create", description: "Create fee records" },
    { name: "fees:read", description: "View fee records" },
    { name: "fees:update", description: "Edit fee records" },
    { name: "fees:delete", description: "Delete fee records" },
    { name: "departments:read", description: "View departments" },
    { name: "departments:create", description: "Create departments" },
    { name: "departments:update", description: "Edit departments" },
    { name: "departments:delete", description: "Delete departments" },
    { name: "academic-years:read", description: "View academic years" },
    { name: "academic-years:create", description: "Create academic years" },
    { name: "academic-years:update", description: "Edit academic years" },
    { name: "academic-years:delete", description: "Delete academic years" },
    { name: "rooms:read", description: "View rooms" },
    { name: "rooms:create", description: "Create rooms" },
    { name: "rooms:update", description: "Edit rooms" },
    { name: "rooms:delete", description: "Delete rooms" },
    { name: "insurance:read", description: "View insurance" },
    { name: "insurance:create", description: "Create insurance" },
    { name: "insurance:update", description: "Edit insurance" },
    { name: "insurance:delete", description: "Delete insurance" },
    { name: "payments:read", description: "View payments" },
    { name: "payments:create", description: "Create payments" },
    { name: "payments:update", description: "Edit payments" },
    { name: "payments:delete", description: "Delete payments" },
    { name: "outgoing-payments:read", description: "View outgoing payments" },
    {
      name: "outgoing-payments:create",
      description: "Create outgoing payments",
    },
    { name: "outgoing-payments:update", description: "Edit outgoing payments" },
    {
      name: "outgoing-payments:delete",
      description: "Delete outgoing payments",
    },
    { name: "categories:read", description: "View categories" },
    { name: "categories:create", description: "Create categories" },
    { name: "categories:update", description: "Edit categories" },
    { name: "categories:delete", description: "Delete categories" },
    { name: "expenses:read", description: "View expenses" },
    { name: "expenses:create", description: "Create expenses" },
    { name: "expenses:update", description: "Edit expenses" },
    { name: "expenses:delete", description: "Delete expenses" },
    { name: "academic-years:read", description: "View academic years" },
    { name: "academic-years:create", description: "Create academic years" },
    { name: "academic-years:update", description: "Edit academic years" },
    { name: "academic-years:delete", description: "Delete academic years" },
    { name: "users:read", description: "View users" },
    { name: "users:create", description: "Create users" },
    { name: "users:update", description: "Edit users" },
    { name: "users:delete", description: "Delete users" },
    { name: "roles:read", description: "View roles" },
    { name: "roles:create", description: "Create roles" },
    { name: "roles:update", description: "Edit roles" },
    { name: "roles:delete", description: "Delete roles" },
    { name: "permissions:read", description: "View permissions" },
    { name: "permissions:create", description: "Create permissions" },
    { name: "permissions:update", description: "Edit permissions" },
    { name: "permissions:delete", description: "Delete permissions" },
    { name: "installments:read", description: "View installments" },
    { name: "installments:create", description: "Create installments" },
    { name: "installments:update", description: "Edit installments" },
    { name: "installments:delete", description: "Delete installments" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log("Assigning SUPER_ADMIN role...");

  const allowedEmails = [
    "hogr.fathalla@btvi.edu.iq",
    "danyar.salih@btvi.edu.iq",
    "karwan.abdalla@btvi.edu.iq",
    "jawhar.wsu@btvi.edu.iq",
    "alan.braim@btvi.edu.iq",
    "aziz.aziz@btvi.edu.iq",
  ];

  function capitalizeFirstLetter(string: string) {
    if (!string) return string; // Handle empty strings
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  for (const email of allowedEmails) {
    const splitEmail = email.split("@")[0];
    const splitDot = splitEmail.split(".");
    const name = `${capitalizeFirstLetter(splitDot[0])} ${capitalizeFirstLetter(splitDot[1])}`;
    await prisma.user.upsert({
      where: { email },
      update: { isAllowed: true },
      create: {
        id: randomUUID(),
        email,
        isAllowed: true,
        name,
      },
    });
  }

  console.log("Allowed users created successfully!");
  // 1️⃣ Make sure SUPER_ADMIN role exists
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "System Super Administrator with full access",
    },
  });

  // 2️⃣ Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // 3️⃣ Attach all permissions to SUPER_ADMIN
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 4️⃣ Find existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: "hogr.fathalla@btvi.edu.iq" },
  });

  if (!existingUser) {
    throw new Error("User IT@superadmin.com not found!");
  }

  // 5️⃣ Assign role to existing user
  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      roleId: superAdminRole.id,
    },
  });

  console.log("SUPER_ADMIN role assigned to:", existingUser.email);
}

main()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
