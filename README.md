# word-flow

Armá nombres de rama de git con la convención de tu equipo. Elegís el tipo, ponés el ticket,
escribís la descripción como la dirías, y sale el nombre listo —sin tildes, sin separadores de
más y válido para git— junto con el `git checkout -b` para pegar en la terminal.

Todo pasa en tu navegador. No hay backend, no hay API, no sale un solo pedido a la red.

```
feature/CON-1234-arreglar-el-login-con-tildes
└──┬──┘ └─┬─┘ └─┬┘ └──────────┬─────────────┘
 tipo  proyecto ticket    descripción
```

## Cómo se usa

Elegís una convención de las que vienen, o escribís tu propia plantilla con los cuatro tokens:

| Token       | De dónde sale         | Qué le hace al valor                                     |
| ----------- | --------------------- | -------------------------------------------------------- |
| `{type}`    | el selector de tipo   | a minúscula y con guiones                                |
| `{project}` | el prefijo del equipo | limpia lo que git no acepta, **conserva las mayúsculas** |
| `{ticket}`  | el número de ticket   | limpia lo que git no acepta, **conserva las mayúsculas** |
| `{slug}`    | la descripción        | a minúscula y con guiones                                |

Todo lo que no sea un token se copia tal cual, así que la plantilla puede tener barras,
guiones o lo que uses.

Las convenciones que vienen listas:

| Preset              | Plantilla                          | Ejemplo                           |
| ------------------- | ---------------------------------- | --------------------------------- |
| Jira / Azure Boards | `{type}/{project}-{ticket}-{slug}` | `feature/CON-1234-arreglar-login` |
| GitFlow             | `{type}/{slug}`                    | `feature/arreglar-login`          |
| Ticket primero      | `{ticket}-{slug}`                  | `1234-arreglar-login`             |

### Atajos

| Teclas                 | Qué hace                    |
| ---------------------- | --------------------------- |
| `Enter`                | copia la rama               |
| `Ctrl`/`Cmd` + `Enter` | copia el comando            |
| `Ctrl`/`Cmd` + `K`     | va a la descripción         |
| `Esc`                  | limpia ticket y descripción |

## Lo que hace bien

Un nombre de rama admite mucho menos de lo que uno escribe en un ticket, y ahí es donde estas
herramientas suelen fallar:

- **Tildes, eñes y demás**: `Corrección de Ñoño` → `correccion-de-nono`. También `ß`, `æ`, `ø`.
- **camelCase**: `fixLoginBug` → `fix-login-bug`, en vez de dejarlo pegoteado.
- **Emoji, cirílico, japonés**: se van, y si no queda nada usable te lo dice en vez de
  devolverte un nombre vacío.
- **Campos vacíos**: si no ponés ticket sale `feature/CON-arreglar-login`, no
  `feature/CON--arreglar-login`.
- **Las reglas de git**: se valida contra `git check-ref-format`, la misma que corre
  `git checkout -b`. Si el nombre no sirve, te dice qué regla rompe, y no te ofrece un
  comando que va a fallar.

## Correrlo

Node 20+ y Yarn Classic 1.22.

```bash
yarn install
yarn dev        # http://localhost:3000
```

| Comando         | Qué hace                            |
| --------------- | ----------------------------------- |
| `yarn dev`      | servidor de desarrollo              |
| `yarn validate` | type-check + lint + formato + tests |
| `yarn build`    | build de producción                 |
| `yarn test`     | Vitest, una corrida                 |
| `yarn e2e`      | Playwright, en el puerto 3100       |

Las decisiones de diseño, con las alternativas que se descartaron y por qué, están en
[`docs/specs/2026-09-03-word-flow-design.md`](docs/specs/2026-09-03-word-flow-design.md).

## De dónde salió

La idea funcional viene de un CodePen de David Beard, «Kabob Kase»: cuarenta líneas de Vue 2
con un selector, dos campos y un botón de copiar. Esto no es un port —no se trajo una línea de
código— sino la misma idea hecha en serio: plantilla configurable en vez de un prefijo
`CON-` escrito a fuego, slug que de verdad normaliza, y validación contra las reglas de git.
