import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { posteAhoraApiRequest, csv } from './GenericFunctions';

export class PosteAhora implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PosteAhora',
		name: 'posteAhora',
		icon: 'file:posteahora.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Schedule and publish social posts with PosteAhora',
		defaults: {
			name: 'PosteAhora',
		},
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		credentials: [
			{
				name: 'posteAhoraApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Accounts',
						value: 'getAccounts',
						description: 'List connected social accounts (call first to get account IDs)',
						action: 'List connected social accounts',
					},
					{
						name: 'Create Post',
						value: 'createPost',
						description: 'Publish now, schedule, or draft a post',
						action: 'Create a post',
					},
					{
						name: 'Get Posts',
						value: 'getPosts',
						description: 'List your posts',
						action: 'List posts',
					},
					{
						name: 'Create Idea',
						value: 'createIdea',
						description: 'Add an idea to the backlog',
						action: 'Create an idea',
					},
					{
						name: 'Get Analytics',
						value: 'getAnalytics',
						description: 'Read performance metrics across platforms',
						action: 'Get analytics',
					},
				],
				default: 'getAccounts',
			},

			// ---- Create Post -------------------------------------------------
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				displayOptions: { show: { operation: ['createPost'] } },
				description: 'The post text',
			},
			{
				displayName: 'Channels',
				name: 'channels',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				placeholder: 'Add Channel',
				displayOptions: { show: { operation: ['createPost'] } },
				description: 'Which connected accounts to post to (from Get Accounts)',
				options: [
					{
						name: 'channel',
						displayName: 'Channel',
						values: [
							{
								displayName: 'Platform',
								name: 'platform',
								type: 'string',
								default: '',
								placeholder: 'instagram, twitter, linkedin, threads, facebook, tiktok…',
							},
							{
								displayName: 'Account ID',
								name: 'accountId',
								type: 'string',
								default: '',
								description: 'The account id from Get Accounts',
							},
						],
					},
				],
			},
			{
				displayName: 'When',
				name: 'status',
				type: 'options',
				default: 'draft',
				displayOptions: { show: { operation: ['createPost'] } },
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'Schedule', value: 'scheduled' },
					{ name: 'Publish Now', value: 'published' },
				],
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduledAt',
				type: 'dateTime',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['createPost'], status: ['scheduled'] } },
				description: 'Future time to publish (ISO 8601)',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['createPost'] } },
				options: [
					{ displayName: 'Title', name: 'title', type: 'string', default: '' },
					{
						displayName: 'Media URLs',
						name: 'mediaUrls',
						type: 'string',
						default: '',
						description: 'Comma-separated public URLs',
					},
					{
						displayName: 'Media Type',
						name: 'mediaType',
						type: 'options',
						default: 'image',
						options: [
							{ name: 'Image', value: 'image' },
							{ name: 'Video', value: 'video' },
						],
					},
					{
						displayName: 'Post Type',
						name: 'postType',
						type: 'options',
						default: 'post',
						options: [
							{ name: 'Post', value: 'post' },
							{ name: 'Reel', value: 'reel' },
							{ name: 'Story', value: 'story' },
						],
					},
					{
						displayName: 'Hashtags',
						name: 'hashtags',
						type: 'string',
						default: '',
						description: 'Comma-separated',
					},
				],
			},

			// ---- Create Idea -------------------------------------------------
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['createIdea'] } },
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				displayOptions: { show: { operation: ['createIdea'] } },
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['createIdea'] } },
				description: 'Comma-separated',
			},

			// ---- Get Posts ---------------------------------------------------
			{
				displayName: 'Status',
				name: 'postStatus',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['getPosts'] } },
				description: 'Filter by status (draft, scheduled, queued, published, failed)',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 200 },
				default: 50,
				displayOptions: { show: { operation: ['getPosts'] } },
			},

			// ---- Get Analytics ----------------------------------------------
			{
				displayName: 'Period',
				name: 'period',
				type: 'options',
				default: '30d',
				displayOptions: { show: { operation: ['getAnalytics'] } },
				options: [
					{ name: 'Last 7 days', value: '7d' },
					{ name: 'Last 30 days', value: '30d' },
					{ name: 'Last 90 days', value: '90d' },
					{ name: 'All time', value: 'all' },
				],
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['getAnalytics'] } },
				description: 'Optional platform filter (e.g. instagram)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const paired = { item: i };

				if (operation === 'getAccounts') {
					const res = await posteAhoraApiRequest.call(this, 'GET', '/accounts');
					for (const account of (res.accounts as IDataObject[]) ?? []) {
						returnData.push({ json: account, pairedItem: paired });
					}
				} else if (operation === 'getPosts') {
					const qs: IDataObject = {};
					const status = this.getNodeParameter('postStatus', i, '') as string;
					if (status) qs.status = status;
					qs.limit = this.getNodeParameter('limit', i, 50) as number;
					const res = await posteAhoraApiRequest.call(this, 'GET', '/posts', {}, qs);
					for (const post of (res.posts as IDataObject[]) ?? []) {
						returnData.push({ json: post, pairedItem: paired });
					}
				} else if (operation === 'getAnalytics') {
					const qs: IDataObject = { period: this.getNodeParameter('period', i, '30d') as string };
					const platform = this.getNodeParameter('platform', i, '') as string;
					if (platform) qs.platform = platform;
					const res = await posteAhoraApiRequest.call(this, 'GET', '/analytics', {}, qs);
					returnData.push({ json: res as IDataObject, pairedItem: paired });
				} else if (operation === 'createIdea') {
					const body: IDataObject = {
						title: this.getNodeParameter('title', i, '') as string,
						caption: this.getNodeParameter('caption', i, '') as string,
						tags: csv(this.getNodeParameter('tags', i, '') as string),
					};
					const res = await posteAhoraApiRequest.call(this, 'POST', '/ideas', body);
					returnData.push({ json: (res.idea as IDataObject) ?? (res as IDataObject), pairedItem: paired });
				} else if (operation === 'createPost') {
					const status = this.getNodeParameter('status', i, 'draft') as string;
					const channels = this.getNodeParameter('channels', i, {}) as IDataObject;
					const channelList = (channels.channel as IDataObject[]) ?? [];
					const accountMappings = channelList.map((c) => ({
						platform: c.platform,
						accountId: c.accountId,
					}));
					const add = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

					const body: IDataObject = {
						caption: this.getNodeParameter('caption', i, '') as string,
						accountMappings,
						status,
						title: (add.title as string) || undefined,
						mediaUrls: csv(add.mediaUrls as string),
						mediaType: (add.mediaType as string) || undefined,
						postType: (add.postType as string) || undefined,
						hashtags: csv(add.hashtags as string),
					};
					if (status === 'scheduled') {
						body.scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
					}
					const res = await posteAhoraApiRequest.call(this, 'POST', '/posts', body);
					returnData.push({ json: res as IDataObject, pairedItem: paired });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
