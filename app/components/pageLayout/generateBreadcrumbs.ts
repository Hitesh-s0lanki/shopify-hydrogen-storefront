export function generateBreadcrumbs(
  pathname: string,
): Array<{label: string; path: string}> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{label: string; path: string}> = [
    {label: 'Home', path: '/'},
  ];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Format label based on segment
    let label = segment;

    // Handle common route patterns
    if (segment === 'collections') {
      label = 'Collections';
    } else if (segment === 'products') {
      label = 'Products';
    } else if (segment === 'pages') {
      label = 'Pages';
    } else if (segment === 'blogs') {
      label = 'Blog';
    } else if (segment === 'account') {
      label = 'Account';
    } else if (segment === 'cart') {
      label = 'Cart';
    } else if (segment === 'search') {
      label = 'Search';
    } else if (segment === 'policies') {
      label = 'Policies';
    } else {
      // Capitalize and format the segment (handle hyphens, etc.)
      label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  return breadcrumbs;
}

