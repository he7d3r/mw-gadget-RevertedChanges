/**
 * RevertedChanges
 *
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
( function ( mw, $ ) {
	'use strict';

	function formatDiff() {
		$( '.diff-ntitle' )
			.css( 'background', '#ffe099' )
			.attr(
				'title',
				'After this edit, the page was restored to an older revision'
			)
			.find( '.patrollink' )
				.css( 'background', '#cfc' );
	}

	function checkHistory( pageId, revId ) {
		( new mw.Api() ).get( {
			action: 'query',
			prop: 'revisions',
			rvprop: 'ids|sha1',
			pageids: pageId,
			rvlimit: 50,
			formatversion: 2,
			continue: ''
		} ).done( function ( data ) {
			var revs = data.query.pages[ 0 ].revisions,
				curSha1 = revs[ 0 ].sha1,
				i;
			// Find the index of the revision being viewed by the user
			for ( i = 1; i < revs.length; i++ ) {
				if ( revs[ i ].revid === revId ) {
					break;
				}
			}
			if ( i + 1 < revs.length && revs[ i ].sha1 === revs[ i + 1 ].sha1 ) {
				// Ignore page moves, page protections, etc
				// which don't change the existing content
				return;
			}
			// Check if the latest revision equals to a revision
			// older than the one being viewed by the user
			for ( i++; i < revs.length; i++ ) {
				if ( revs[ i ].sha1 === curSha1 ) {
					// Someone restored an older revision of the page, by
					// reverting/undoing the one presented in this diff
					formatDiff();
					break;
				}
			}
		} );
	}

	mw.hook( 'wikipage.diff' ).add( function ( diffTable ) {
		mw.loader.using( [ 'mediawiki.api', 'mediawiki.util' ] )
		.done( function () {
			var revId;
			if ( mw.util.getParamValue( 'diff' ) !== null && mw.config.get( 'wgArticleId' ) !== 0 ) {
				checkHistory( mw.config.get( 'wgArticleId' ), mw.config.get( 'wgRevisionId' ) );
				return;
			} else {
				revId = parseInt( mw.util.getParamValue(
						'oldid',
						$( diffTable )
							.find( '.diff-ntitle a[href*="oldid="]:first' )
							.attr( 'href' )
					), 10 );
				( new mw.Api() ).get( {
					action: 'query',
					prop: 'revisions',
					rvprop: 'ids',
					revids: revId,
					formatversion: 2
				} ).done( function ( data ) {
					checkHistory( data.query.pages[ 0 ].pageid, revId );
				} );
			}
		} );
	} );

}( mediaWiki, jQuery ) );
