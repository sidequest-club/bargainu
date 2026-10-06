import type { ReactNode, SVGProps } from 'react'

// Hand-made line icons. They inherit colour and take their size from the .icon class.
type IconProps = SVGProps<SVGSVGElement>

const base = (children: ReactNode, { className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={['icon', className].filter(Boolean).join(' ')}
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
)

export const HeartIcon = (p: IconProps) =>
  base(
    <path d="M12 20.2C6.6 16.4 3.2 13 3.2 9.2 3.2 6.6 5.2 4.8 7.6 4.8c1.8 0 3.3 1 4.4 2.6 1.1-1.6 2.6-2.6 4.4-2.6 2.4 0 4.4 1.8 4.4 4.4 0 3.8-3.4 7.2-8.8 11z" />,
    p,
  )

export const ArrowIcon = (p: IconProps) => base(<path d="M4 12h15M13.5 6l6 6-6 6" />, p)

export const ArrowOutIcon = (p: IconProps) => base(<path d="M7 17 17.5 6.5M9 6.2h8.8V15" />, p)

export const ClockIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2.2" />
    </>,
    p,
  )

export const PinIcon = (p: IconProps) =>
  base(
    <>
      <path d="M12 21c4.4-4.6 6.6-8 6.6-11A6.6 6.6 0 0 0 5.4 10c0 3 2.2 6.400 6.600 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>,
    p,
  )

export const CloseIcon = (p: IconProps) => base(<path d="M6 6l12 12M18 6 6 18" />, p)

export const FilterIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3.500 7.500h9M17.500 7.500h3M3.500 16.500h3M11.500 16.500h9" />
      <circle cx="15" cy="7.500" r="2.400" />
      <circle cx="9" cy="16.500" r="2.400" />
    </>,
    p,
  )

export const HomeIcon = (p: IconProps) =>
  base(
    <path d="M3.800 11.200 12 4.200l8.200 7M6 9.800V19.800h4.400v-5.200h3.200v5.200H18V9.800" />,
    p,
  )

export const GridIcon = (p: IconProps) =>
  base(
    <>
      <rect x="4" y="4" width="6.600" height="6.600" rx="1.200" />
      <rect x="13.400" y="4" width="6.600" height="6.600" rx="1.200" />
      <rect x="4" y="13.400" width="6.600" height="6.600" rx="1.200" />
      <rect x="13.400" y="13.400" width="6.600" height="6.600" rx="1.200" />
    </>,
    p,
  )

export const UserIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="12" cy="8.400" r="3.800" />
      <path d="M4.600 20c.8-3.800 3.600-5.800 7.400-5.800s6.600 2 7.400 5.800" />
    </>,
    p,
  )

export const SearchIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="10.800" cy="10.800" r="6.400" />
      <path d="m15.600 15.600 4.600 4.600" />
    </>,
    p,
  )

export const CheckIcon = (p: IconProps) => base(<path d="m5 12.600 4.600 4.600L19.200 7" />, p)

export const StarIcon = (p: IconProps) =>
  base(
    <path d="m12 3.600 2.500 5.400 5.900.7-4.400 4 1.200 5.800L12 16.600 6.800 19.500 8 13.700l-4.400-4 5.900-.7z" />,
    p,
  )

export const PawIcon = (p: IconProps) =>
  base(
    <>
      <path d="M12 12.400c-2.600 0-4.800 2.200-4.800 4.400 0 1.600 1.400 2.400 2.800 2 .8-.2 1.300-.4 2-.4s1.200.2 2 .4c1.400.4 2.800-.4 2.800-2 0-2.200-2.200-4.400-4.800-4.400z" />
      <circle cx="6" cy="10.400" r="1.500" />
      <circle cx="9.600" cy="6.400" r="1.500" />
      <circle cx="14.400" cy="6.400" r="1.500" />
      <circle cx="18" cy="10.400" r="1.500" />
    </>,
    p,
  )

export const BoneIcon = (p: IconProps) =>
  base(
    <path d="M8.600 13.800 13.800 8.600a2.400 2.400 0 1 1 3.600-2.400 2.400 2.400 0 1 1-1.400 4l-5.600 5.600a2.400 2.400 0 1 1-3.600 2.400 2.400 2.400 0 1 1 1.800-4.400z" />,
    p,
  )

export const YenIcon = (p: IconProps) =>
  base(<path d="m6.500 4.500 5.500 8 5.500-8M12 12.500V20M7.500 12.500h9M7.500 16h9" />, p)

export const TagIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3.800 12.600V4.800h7.800l8.600 8.600-7.800 7.800z" />
      <circle cx="8.200" cy="9.200" r="1.300" />
    </>,
    p,
  )
