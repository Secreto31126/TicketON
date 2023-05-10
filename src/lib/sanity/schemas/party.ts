import { defineType, defineField } from 'sanity';

// _id is the private key
const Party = defineType({
	name: 'party',
	type: 'document',
	title: 'Fiesta',
	fields: [
		defineField({
			title: 'Nombre',
			name: 'name',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'published',
			type: 'boolean',
			initialValue: false,
			hidden: true,
			readOnly: true,
			validation: (Rule) => Rule.required()
		}),
		defineField({
			title: 'Slug',
			description: 'Después de escribir el nombre, haga click en Generar',
			type: 'slug',
			name: 'slug',
			options: {
				source: 'name'
			},
			// Enforce an unique and unchangeable slug
			// Hide it from the UI since it's not editable after publishing
			readOnly: ({ document }) => !!document?.published || !document?.name,
			hidden: ({ document }) => !!document?.published,
			validation: (Rule) =>
				Rule.required().custom((_, context) => {
					return !context.document?.published && !Rule.valueOfField('name')
						? 'Defina el Nombre de la fiesta primero'
						: true;
				})
		}),
		defineField({
			title: 'Fecha',
			name: 'date',
			type: 'date',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			title: 'Foto',
			name: 'image',
			type: 'image',
			options: {
				hotspot: true
			}
		})
	]
});

export default Party;
