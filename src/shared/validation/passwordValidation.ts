export function validatePasswordStrength(password: string): string | null {
  if (password.length > 128) return "máximo 128 caracteres";
  if (!/^[A-Za-z\d@$!%*?&]+$/.test(password)) {
    return "solo letras, números y caracteres especiales (@$!%*?&)";
  }
  const requirements = [
    { regex: /.{8,}/, msg: "mínimo 8 caracteres" },
    { regex: /[A-Z]/, msg: "al menos una mayúscula" },
    { regex: /[a-z]/, msg: "al menos una minúscula" },
    { regex: /[0-9]/, msg: "al menos un número" },
    { regex: /[@$!%*?&]/, msg: "al menos un carácter especial (@$!%*?&)" },
  ];

  for (const requirement of requirements) {
    if (!requirement.regex.test(password)) return requirement.msg;
  }

  return null;
}
