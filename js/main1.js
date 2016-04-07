/*global _obsidianSettings:false, AudiothemeTracks:false */

window.cue = window.cue || {};
window.obsidian = window.obsidian || {};

(function( window, $, undefined ) {
	'use strict';

	var cue      = window.cue,
		obsidian = window.obsidian;

	// Localize jquery.cue.js.
	cue.l10n = $.extend( cue.l10n, _obsidianSettings.l10n );

	$.extend( obsidian, {
		config: {
			tracklist: {
				cueSkin: 'obsidian-tracklist',
				cueSelectors: {
					playlist: '.tracklist-area',
					track: '.track',
					trackCurrentTime: '.track-current-time',
					trackDuration: '.track-duration'
				},
				features: ['cueplaylist'],
				pluginPath: _obsidianSettings.mejs.pluginPath
			}
		},

		init: function() {
			$( 'body' ).addClass( 'ontouchstart' in window || 'onmsgesturechange' in window ? 'touch' : 'no-touch' );

			// Open external links in a new window.
			$( '.js-maybe-external' ).each(function() {
				if ( this.hostname && this.hostname !== window.location.hostname ) {
					$( this ).attr( 'target', '_blank' );
				}
			});

			// Open new windows for links with a class of '.js-popup'.
			$( '.js-popup' ).on( 'click', function( e ) {
				var $this       = $( this ),
					popupId     = $this.data( 'popup-id' ) || 'popup',
					popupUrl    = $this.data( 'popup-url' ) || $this.attr( 'href' ),
					popupWidth  = $this.data( 'popup-width' ) || 550,
					popupHeight = $this.data( 'popup-height' ) || 260;

				e.preventDefault();

				window.open( popupUrl, popupId, [
					'width=' + popupWidth,
					'height=' + popupHeight,
					'directories=no',
					'location=no',
					'menubar=no',
					'scrollbars=no',
					'status=no',
					'toolbar=no'
				].join( ',' ) );
			});
		},

		/**
		 * Set up the background image.
		 *
		 * Prevents the background image from jumping/zooming on mobile devices
		 * after scrolling.
		 */
		setupBackground: function() {
			var isThrottled = false,
				$overlay = $( '.obsidian-background-overlay' );

			if ( ! this.isMobile() ) {
				return;
			}

			$overlay.css( 'bottom', 'auto' ).height( screen.height );

			$( window ).on( 'load orientationchange resize', function() {
				if ( isThrottled ) {
					return;
				}

				isThrottled = true;
				setTimeout(function() {
					$overlay.height( screen.height );
					isThrottled = false;
				}, 150 );
			});
		},

		/**
		 * Set up the main navigation.
		 */
		setupNavigation: function() {
			var blurTimeout,
				$navigation = $( '.site-navigation' ),
				$menu = $navigation.find( '.menu' ),
				$toggleButton = $( '.site-navigation-toggle' );

			// Append sub-menu toggle elements.
			$menu.find( 'ul' ).parent().children( 'a' ).append( '<button class="sub-menu-toggle"></button>' );

			// Toggle the main menu.
			$toggleButton.on( 'click', function() {
				$navigation.toggleClass( 'is-open' );
			});

			// Toggle sub-menus.
			$menu.on( 'mouseenter', 'li', function() {
				$( this ).addClass( 'is-active' ).addClass(function() {
					return $toggleButton.is( ':visible' ) ? '' : 'is-sub-menu-open';
				});
			}).on( 'mouseleave', 'li', function() {
				$( this ).removeClass( 'is-active' ).removeClass(function() {
					return $toggleButton.is( ':visible' ) ? '' : 'is-sub-menu-open';
				});
			}).on( 'focus', 'a', function() {
				var $this = $( this ),
					$parents = $( this ).parents( 'li' );

				$parents.addClass( 'is-active' );

				// Open the top-level menu item when focused if the toggle button isn't visible.
				if ( $this.parent().hasClass( 'menu-item-has-children' ) && ! $this.children( '.sub-menu-toggle' ).is( ':visible' ) ) {
					$parents.last().addClass( 'is-sub-menu-open' );
				}
			}).on( 'blur', 'a', function() {
				clearTimeout( blurTimeout );

				// Hack to grab the activeElement after the blur event has been processed.
				blurTimeout = setTimeout(function() {
					var $parents = $( document.activeElement ).parents( 'li' );
					$menu.find( 'li' ).not( $parents ).removeClass(function() {
						return $toggleButton.is( ':visible' ) ? '' : 'is-sub-menu-open';
					});
				}, 1 );
			}).on( 'click', '.sub-menu-toggle', function( e ) {
				e.preventDefault();
				$( this ).closest( 'li' ).toggleClass( 'is-sub-menu-open' );
			});
		},

		setupTracklist: function() {
			var $tracklist = $( '.tracklist-area' );

			if ( $tracklist.length && $.isFunction( $.fn.cuePlaylist ) ) {
				$tracklist.cuePlaylist( $.extend( this.config.tracklist, {
					cuePlaylistTracks: AudiothemeTracks.record
				}));
			}
		},

		/**
		 * Set up videos.
		 *
		 * - Makes videos responsive.
		 * - Moves videos embedded in page content to an '.entry-video'
		 *   container. Used primarily with the WPCOM single video templates.
		 */
		setupVideos: function() {
			if ( $.isFunction( $.fn.fitVids ) ) {
				$( '.hentry' ).fitVids();
			}

			$( 'body.page' ).find( '.single-video' ).find( '.jetpack-video-wrapper' ).first().appendTo( '.entry-video' );
		},

		/**
		 * Whether the current device is mobile.
		 *
		 * @return {boolean}
		 */
		isMobile: function() {
			return ( /Android|iPhone|iPad|iPod|BlackBerry/i ).test( navigator.userAgent || navigator.vendor || window.opera );
		}
	});

	// Document ready.
	jQuery(function() {
		obsidian.init();
		obsidian.setupBackground();
		obsidian.setupNavigation();
		obsidian.setupTracklist();
		obsidian.setupVideos();
	});
})( this, jQuery );