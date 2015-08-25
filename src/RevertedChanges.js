/**
 * RevertedChanges
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
( function ( mw, $ ) {
	'use strict';

	function formatDiff() {
		mw.util.addCSS( '#mw-diff-ntitle1 { background: #ffe099; }' );
		$( '#mw-diff-ntitle1' )
			.attr(
				'title',
				'After this edit, the page was restored to an older revision'
			);
	}

	function checkHistory() {
		( new mw.Api() ).get( {
			action: 'query',
			prop: 'revisions',
			rvprop: 'ids|sha1',
			pageids: mw.config.get( 'wgArticleId' ),
			rvlimit: 50,
			formatversion: 2,
			continue: ''
		} ).done( function ( data ) {
			var revs = data.query.pages[0].revisions,
				curSha1 = revs[0].sha1,
				i;
			for( i = 1; i < revs.length; i++ ) {
				if( revs[i].revid === mw.config.get( 'wgRevisionId' ) ) {
					break;
				}
			}
			for( i++; i < revs.length; i++ ) {
				if( revs[i].sha1 === curSha1 ) {
					// Someone restored an older revision of the page, by
					// reverting/undoing the one presented in this diff
					formatDiff();
					break;
				}
			}
		} );
	}

	if ( mw.util.getParamValue( 'diff' ) !== null ) {
		$.when(
			mw.loader.using( [ 'mediawiki.api' ] ),
			$.ready
		).then( checkHistory );
	}

}( mediaWiki, jQuery ) );
