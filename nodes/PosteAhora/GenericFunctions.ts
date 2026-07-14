import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/** Authenticated request against the PosteAhora public REST API (/v1). */
export async function posteAhoraApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('posteAhoraApi');
	const baseURL = ((credentials.baseUrl as string) || 'https://api.posteahora.com/functions/v1/api').replace(
		/\/+$/,
		'',
	);

	const options: IHttpRequestOptions = {
		baseURL,
		method,
		url: resource,
		body,
		qs,
		json: true,
	};

	if (!Object.keys(body).length) delete options.body;
	if (!Object.keys(qs).length) delete options.qs;

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'posteAhoraApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/** Split a comma-separated string field into a trimmed array (empty → undefined). */
export function csv(value: string | undefined): string[] | undefined {
	if (!value) return undefined;
	const arr = value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	return arr.length ? arr : undefined;
}
