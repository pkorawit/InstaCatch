/**
  * @author Hernan Mateo Rosales
  * @link https://snuin@bitbucket.org/snuin/instagram-public-api-fetcher.git
*/
"use-strict";
const fetch = require('node-fetch');

const BASE_URL = 'https://www.instagram.com';
const USER_POSTS_QUERY_HASH = '472f257a40c653c64c666ce877d59d2b';
const HASHTAG_POSTS_QUERY_HASH = '298b92c8d7cad703f7565aa892ede943';
const RANK_TOKEN = '0.41173093927606486'; //??

module.exports = class Instagram
{
	constructor() {}

	/**
	* User data by username
	* @param {String} q
	* @return {Object} Promise
	*/
	search(q) {
		return new Promise((resolve, reject) => {
			fetch(BASE_URL+'/web/search/topsearch/?context=blended&query='+q+'&rank_token='+RANK_TOKEN)
			.then(x => x.json())
			.then(body => {
				resolve(body)
			})
			.catch(e => {
				reject(e)
			})
		});
	}

	/**
	* User data by username
	* @param {String} username
	* @return {Object} Promise
	*/
	getDataByUsername(username) {
		return new Promise((resolve, reject) => {
			fetch(BASE_URL+'/'+username+'/?__a=1')
			.then(x => x.json())
			.then(body => {
				resolve(body.user);
			})
			.catch(e => {
				reject(e)
			})
		});
	}

	/**
	* User data by hashtag
	* @param {String} shortcode
	* @return {Object} Promise
	*/
	getPostByShortcode(shortcode) {
		return new Promise((resolve, reject) => {
			let url = BASE_URL+'/p/'+shortcode+'/?__a=1';
			fetch(url)
			.then(x => x.json())
			.then(body => {
				resolve(body.graphql.shortcode_media)
				//body.graphql.shortcode_media.owner.username
			})
			.catch(e => {
				reject(e)
			})
		});
	}

	/**
	* User data by hashtag
	* @param {String} shortcode
	* @return {Object} Promise
	*/
	async getUsernameByShortcode(shortcode) {
		let postData = await this.getPostByShortcode(shortcode);
		return postData.owner.username
	}

	/**
	* User posts by user id
	* @param {String} user_id
	* @param {Integer} limit
	* @param {String} end_cursor
	* @return {Object} Promise
	*/
	getPostsByUserId(user_id, limit, end_cursor = null) {
		return new Promise((resolve,reject) => {
			var url = null;
			var posts = [];

			if (end_cursor) {
				url = BASE_URL+'/graphql/query/?query_hash='+USER_POSTS_QUERY_HASH+'&variables={"id":"'+user_id+'","first":'+limit+',"after":"'+end_cursor+'"}';			
			} else {
				url = BASE_URL+'/graphql/query/?query_hash='+USER_POSTS_QUERY_HASH+'&variables={"id":"'+user_id+'","first":'+limit+'}';
			}			
			fetch(url)
			.then(x => x.json())
			.then(body => {
				posts.push(...body.data.user.edge_owner_to_timeline_media.edges);
				resolve({
					posts: posts, 
					end_cursor: body.data.user.edge_owner_to_timeline_media.page_info.end_cursor, 
					has_next_page: body.data.user.edge_owner_to_timeline_media.page_info.has_next_page
				});
			})
			.catch(e => {
				reject(e);
			})
		});
	}

	/**
	* User data by hashtag
	* @param {String} hashtag
	* @return {Object} Promise
	*/
	getDataByHashtag(tag_name) {
		return new Promise((resolve, reject) => {
			fetch(BASE_URL+'/explore/tags/'+tag_name+'/?__a=1')
			.then(x => x.json())
			.then(body => {
				resolve(body)
			})
			.catch(e => {
				reject(e)
			})
		});
	}

	/**
	* User data by location
	* @param {String} LocationId
	* @return {Object} Promise
	*/
	getDataByLocation(location_id) {
		return new Promise((resolve, reject) => {
			fetch(BASE_URL+'/explore/locations/'+location_id+'/?__a=1')
			.then(x => x.json())
			.then(body => {
				resolve(body)
			})
			.catch(e => {
				reject(e)
			})
		});
	}

	/**
	* User posts by user id
	* @param {String} tag_name
	* @param {Integer} limit
	* @param {String} end_cursor
	* @return {Object} Promise
	*/
	getPostsByHashtag(tag_name, limit, end_cursor = null) {
		return new Promise((resolve,reject) => {
			var url = null;
			var posts = [];
			var top_posts = [];

			if (end_cursor) {
				url = BASE_URL+'/graphql/query/?query_hash='+HASHTAG_POSTS_QUERY_HASH+'&variables={"tag_name":"'+tag_name+'","first":'+limit+',"after":"'+end_cursor+'"}';			
			} else {
				url = BASE_URL+'/graphql/query/?query_hash='+HASHTAG_POSTS_QUERY_HASH+'&variables={"tag_name":"'+tag_name+'","first":'+limit+'}';
			}			
			fetch(url)
			.then(x => x.json())
			.then(body => {
				top_posts.push(...body.data.hashtag.edge_hashtag_to_top_posts.edges);
				posts.push(...body.data.hashtag.edge_hashtag_to_media.edges);
				resolve({
					top_posts: top_posts, 
					posts: posts, 
					end_cursor: body.data.hashtag.edge_hashtag_to_media.page_info.end_cursor, 
					has_next_page: body.data.hashtag.edge_hashtag_to_media.page_info.has_next_page
				});
			})
			.catch(e => {
				reject(e);
			})
		});
	}
}