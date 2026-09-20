ALTER TABLE `plantation_plots`
  ADD `mapStatus` enum('tapping','immature','suspended') NOT NULL DEFAULT 'tapping',
  ADD `boundaryGeoJson` text;
