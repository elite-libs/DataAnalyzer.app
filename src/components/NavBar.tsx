import React from 'react'
import StorageIcon from '@material-ui/icons/Storage'
export default function NavBar () {
  return (
    <nav className='schema-app-nav navbar navbar-expand-lg navbar-dark bg-primary'>
      <div
        className='head-icon m-2 d-flex align-items-center'
        style={{ width: '48px', flexShrink: 1 }}
      >
        <StorageIcon style={{ fontSize: '40px' }} className='text-white' />
      </div>

      <a
        className='navbar-brand'
        href='https://github.com/justsml/schema-generator'
      >
        Dan's Schema Generator
      </a>

      <ul className='navbar-nav ml-auto'>
        <li className='nav-item'>
          <a className='nav-link' href='https://danlevy.net' target='_blank'> {/* eslint-disable-line */}
            Author
          </a>
        </li>
        <li className='nav-item'>
          <a
            className='nav-link'
            href='https://github.com/justsml/schema-generator'
          >
            GitHub
          </a>
        </li>
      </ul>
    </nav>
  )
}
