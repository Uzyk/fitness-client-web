# Configuración panel Admin (Pablo)

## URLs

| Ruta | Uso |
|------|-----|
| `/app` o `/admin` | **Portal único** — login y panel según rol |
| `/invite?token=...` | Registro de coach (link por email) |

## 1. Crear tu cuenta admin

1. Regístrate en Supabase Auth (desde `/admin` intenta login, o crea usuario en Supabase Dashboard → Authentication).
2. En **SQL Editor** de Supabase, asigna rol admin a tu usuario:

```sql
-- Reemplaza con tu email
update public.profiles
set role = 'admin'
where email = 'tu-email@ejemplo.com';
```

Si el perfil no existe aún:

```sql
insert into public.profiles (id, role, full_name, email)
select id, 'admin', 'Pablo', email
from auth.users
where email = 'tu-email@ejemplo.com'
on conflict (id) do update set role = 'admin';
```

## 2. Agregar un coach (ej: Vania)

1. Entra a `/admin` con tu cuenta admin.
2. **+ Agregar coach** → nombre de marca, email que te pasaron, paleta de colores.
3. Copia el **link de invitación** y envíaselo por email/WhatsApp.
4. Vania abre el link → crea contraseña → entra a `/app` con su panel y sus colores.

## 3. Cambiar paleta de un coach

1. En el listado, **Editar paleta**.
2. Ajusta colores o elige un preset.
3. Guardar — el coach verá los cambios al recargar `/app`.

## Variables de entorno

Mismas que el resto del proyecto:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Notas

- El link de invitación expira a los **14 días**.
- El email al registrarse debe coincidir con el de la invitación.
- Envío automático de email: pendiente (Edge Function + Resend). Por ahora copias el link manualmente.
