import { Button, Field, SectionTitle } from '../components/ui.js';
import { avatarOptions, defaultAvatar, useLocalAvatars } from '../hooks/useLocalAvatars.js';
import { cx, h } from '../utils.js';

const {useState} = React;

export function UsersPage({state}) {
  const [form, setForm] = useState({nombre: '', email: '', tipo_dieta: 'normal', alergias: '', presupuesto: 5, tiempo_disponible: 30});
  const [draftAvatar, setDraftAvatar] = useState(defaultAvatar);
  const {avatarFor, setAvatar} = useLocalAvatars();
  const update = (key, value) => setForm((current) => ({...current, [key]: value}));
  const updateAvatar = (key, value) => setDraftAvatar((current) => ({...current, [key]: value}));

  async function submit(event) {
    event.preventDefault();
    const created = await state.createUser({...form, presupuesto: Number(form.presupuesto), tiempo_disponible: Number(form.tiempo_disponible)});
    setAvatar(created.id, draftAvatar);
    setForm({nombre: '', email: '', tipo_dieta: 'normal', alergias: '', presupuesto: 5, tiempo_disponible: 30});
    setDraftAvatar(defaultAvatar);
  }

  return h('section', {className: 'page users-page'},
    h(SectionTitle, {eyebrow: 'paso 1', title: 'Usuarios y preferencias'}, 'Crea o selecciona el perfil que alimentará la refri, el recetario y la recomendación.'),
    h('div', {className: 'users-layout'},
      h('div', {className: 'user-gallery'}, state.users.map((user) =>
        h(UserCharacterCard, {
          key: user.id,
          user,
          avatar: avatarFor(user),
          active: String(user.id) === String(state.activeUserId),
          onSelect: () => state.setActiveUser(user.id),
          onAvatarChange: (avatar) => setAvatar(user.id, avatar)
        })
      )),
      h('form', {className: 'organic-form', onSubmit: submit},
        h('p', {className: 'eyebrow'}, 'nuevo perfil'),
        h('h3', null, 'Diseña el paladar'),
        h(CharacterPreview, {avatar: draftAvatar}),
        h('div', {className: 'avatar-builder'},
          h(AvatarPicker, {label: 'Sombrero', value: draftAvatar.hat, options: avatarOptions.hat, onChange: (value) => updateAvatar('hat', value)}),
          h(AvatarPicker, {label: 'Expresión', value: draftAvatar.face, options: avatarOptions.face, onChange: (value) => updateAvatar('face', value)}),
          h(AvatarPicker, {label: 'Utensilio', value: draftAvatar.tool, options: avatarOptions.tool, onChange: (value) => updateAvatar('tool', value)}),
          h(ColorPicker, {value: draftAvatar.color, onChange: (value) => updateAvatar('color', value)})
        ),
        h(Field, {label: 'Nombre'}, h('input', {value: form.nombre, required: true, onChange: (e) => update('nombre', e.target.value), placeholder: 'Ana Torres'})),
        h(Field, {label: 'Email'}, h('input', {value: form.email, required: true, type: 'email', onChange: (e) => update('email', e.target.value), placeholder: 'ana@demo.com'})),
        h('div', {className: 'form-grid'},
          h(Field, {label: 'Dieta'}, h('select', {value: form.tipo_dieta, onChange: (e) => update('tipo_dieta', e.target.value)},
            ['normal', 'vegetariano', 'sin lactosa', 'baja en carbohidratos'].map((item) => h('option', {key: item, value: item}, item))
          )),
          h(Field, {label: 'Alergias'}, h('input', {value: form.alergias, onChange: (e) => update('alergias', e.target.value), placeholder: 'maní, lactosa...'}))
        ),
        h('div', {className: 'form-grid'},
          h(Field, {label: 'Presupuesto'}, h('input', {type: 'number', min: '0', step: '0.5', value: form.presupuesto, onChange: (e) => update('presupuesto', e.target.value)})),
          h(Field, {label: 'Tiempo'}, h('input', {type: 'number', min: '5', value: form.tiempo_disponible, onChange: (e) => update('tiempo_disponible', e.target.value)}))
        ),
        h(Button, {type: 'submit', disabled: state.loading.createUser}, state.loading.createUser ? 'Guardando...' : 'Crear usuario')
      )
    )
  );
}

function UserCharacterCard({user, avatar, active, onSelect, onAvatarChange}) {
  function cycle(key) {
    const options = avatarOptions[key];
    const next = options[(options.indexOf(avatar[key]) + 1) % options.length];
    onAvatarChange({...avatar, [key]: next});
  }

  return h('article', {className: cx('user-tile character-tile', active && 'active')},
    h('button', {className: 'user-select-zone', onClick: onSelect},
      h(CharacterPreview, {avatar}),
      h('strong', null, user.nombre),
      h('small', null, user.tipo_dieta || 'normal'),
      h('div', {className: 'mini-metrics'},
        h('span', null, `$${user.presupuesto || 0}`),
        h('span', null, `${user.tiempo_disponible || 30} min`)
      ),
      h('p', null, user.alergias ? `Alergias: ${user.alergias}` : 'Sin alergias registradas')
    ),
    h('div', {className: 'character-actions'},
      h('button', {type: 'button', onClick: () => cycle('hat'), title: 'Cambiar sombrero'}, '🎩'),
      h('button', {type: 'button', onClick: () => cycle('face'), title: 'Cambiar expresión'}, '🙂'),
      h('button', {type: 'button', onClick: () => cycle('tool'), title: 'Cambiar utensilio'}, '🥄')
    )
  );
}

function CharacterPreview({avatar}) {
  return h('div', {className: cx('character-preview', `avatar-${avatar.color}`)},
    h('span', {className: 'char-hat'}, avatar.hat),
    h('span', {className: 'char-face'}, avatar.face),
    h('span', {className: 'char-tool'}, avatar.tool)
  );
}

function AvatarPicker({label, value, options, onChange}) {
  return h('label', {className: 'avatar-picker'},
    h('span', null, label),
    h('select', {value, onChange: (event) => onChange(event.target.value)},
      options.map((option) => h('option', {key: option, value: option}, option))
    )
  );
}

function ColorPicker({value, onChange}) {
  return h('div', {className: 'color-picker'},
    h('span', null, 'Color'),
    h('div', null, avatarOptions.color.map((color) =>
      h('button', {type: 'button', key: color, className: cx('color-dot', `avatar-${color}`, value === color && 'active'), onClick: () => onChange(color)}, color)
    ))
  );
}
