import { expect, describe, it } from 'vitest';
import { getConnectionMetadataFromTokenResponse, parseConnectionConfigParamsFromTemplate, getAdditionalAuthorizationParams } from './utils.js';
import type { Template as ProviderTemplate } from '@nangohq/shared';

describe('Utils unit tests', () => {
    it('Should parse template connection config params', () => {
        const authTemplate = {
            name: 'braintree',
            provider: 'braintree',
            authorization_url: 'https://api.${connectionConfig.auth}.com/oauth/authorize'
        };

        const connectionConfigAuth = parseConnectionConfigParamsFromTemplate(authTemplate as unknown as ProviderTemplate);
        expect(connectionConfigAuth).toEqual(['auth']);

        const tokenTemplate = {
            name: 'braintree',
            provider: 'braintree',
            token_url: 'https://api.${connectionConfig.token}.com/oauth/access_token'
        };

        const connectionConfigToken = parseConnectionConfigParamsFromTemplate(tokenTemplate as unknown as ProviderTemplate);
        expect(connectionConfigToken).toEqual(['token']);
    });

    it('Should extract metadata from token response based on template', () => {
        const template: ProviderTemplate = {
            token_response_metadata: ['incoming_webhook.url', 'ok', 'bot_user_id', 'scope']
        } as ProviderTemplate;

        const params = {
            ok: true,
            scope: 'chat:write,channels:read,team.billing:read,users:read,channels:history,channels:join,incoming-webhook',
            token_type: 'bot',
            bot_user_id: 'abcd',
            enterprise: null,
            is_enterprise_install: false,
            incoming_webhook: {
                channel_id: 'foo',
                configuration_url: 'https://nangohq.slack.com',
                url: 'https://hooks.slack.com'
            }
        };

        const result = getConnectionMetadataFromTokenResponse(params, template);
        expect(result).toEqual({
            'incoming_webhook.url': 'https://hooks.slack.com',
            ok: true,
            bot_user_id: 'abcd',
            scope: 'chat:write,channels:read,team.billing:read,users:read,channels:history,channels:join,incoming-webhook'
        });
    });

    it('Should extract metadata from token response based on template and if it does not exist not fail', () => {
        const template: ProviderTemplate = {
            token_response_metadata: ['incoming_webhook.url', 'ok']
        } as ProviderTemplate;

        const params = {
            scope: 'chat:write,channels:read,team.billing:read,users:read,channels:history,channels:join,incoming-webhook',
            token_type: 'bot',
            enterprise: null,
            is_enterprise_install: false,
            incoming_webhook: {
                configuration_url: 'foo.bar'
            }
        };

        const result = getConnectionMetadataFromTokenResponse(params, template);
        expect(result).toEqual({});
    });

    it('Should not extract metadata from an empty token response', () => {
        const template: ProviderTemplate = {
            token_response_metadata: ['incoming_webhook.url', 'ok']
        } as ProviderTemplate;

        const params = {};

        const result = getConnectionMetadataFromTokenResponse(params, template);
        expect(result).toEqual({});
    });

    it('Should return additional authorization params with string values only and preserve undefined values', () => {
        const params = {
            key1: 'value1',
            key2: 123,
            key3: true,
            key4: 'undefined',
            key5: 'value5'
        };

        const result = getAdditionalAuthorizationParams(params);
        expect(result).toEqual({
            key1: 'value1',
            key4: undefined,
            key5: 'value5'
        });
    });

    it('Should return an empty object when no string values are present', () => {
        const params = {
            key1: 123,
            key2: true
        };

        const result = getAdditionalAuthorizationParams(params);
        expect(result).toEqual({});
    });

    it('Should handle an empty params object', () => {
        const params = {};

        const result = getAdditionalAuthorizationParams(params);
        expect(result).toEqual({});
    });

    it('Should handle an non-object param', () => {
        const params = "I'm not an object";

        const result = getAdditionalAuthorizationParams(params);
        expect(result).toEqual({});
    });

    it('Should handle a null & undefined param', () => {
        let result = getAdditionalAuthorizationParams(null);
        expect(result).toEqual({});
        result = getAdditionalAuthorizationParams(undefined);
        expect(result).toEqual({});
    });
});
