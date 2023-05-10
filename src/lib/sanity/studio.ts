import type { DocumentActionComponent, DocumentActionProps, DocumentActionsResolver } from 'sanity';

import { defineConfig, useDocumentOperation } from 'sanity';
import { deskTool } from 'sanity/desk';
import Party from './schemas/party';

function createOnPublishAction(originalPublishAction: DocumentActionComponent) {
	return (props: DocumentActionProps) => {
		const { patch } = useDocumentOperation(props.id, props.type);

		const originalResult = originalPublishAction(props);
		return {
			...originalResult,
			onHandle: () => {
				patch.execute([
					{
						set: {
							published: true
						}
					}
				]);

				// delegate to original handler
				originalResult?.onHandle?.();
			}
		};
	};
}

export default function Studio(projectId: string, dataset: string, pathname: string) {
	return defineConfig({
		plugins: [deskTool()],
		projectId: projectId,
		dataset: dataset,
		basePath: pathname,
		schema: {
			types: [Party]
		},
		document: {
			actions: ((prev) => {
				return prev.map((original) => {
					return original.action === 'publish' ? createOnPublishAction(original) : original;
				});
			}) as DocumentActionsResolver
		}
	});
}
